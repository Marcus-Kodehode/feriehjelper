"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";

const BudgetContext = createContext(null);

const readLS = (key) => {
  try {
    return key ? JSON.parse(localStorage.getItem(key) || "[]") : [];
  } catch {
    return [];
  }
};
const writeLS = (key, val) => {
  try {
    if (key) localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

export function BudgetProvider({ children }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const storageKey = useMemo(
    () => (isLoaded && isSignedIn ? `budgets:${userId}` : null),
    [isLoaded, isSignedIn, userId]
  );

  const [budgets, setBudgets] = useState([]);
  const hydrated = useRef(false);

  // Hydrer ved inn/utlogging
  useEffect(() => {
    if (!isLoaded) return;
    // rydd bort ev. gammel guest-cache
    try {
      if (!isSignedIn) localStorage.removeItem("budgets:guest");
    } catch {}
    setBudgets(storageKey ? readLS(storageKey) : []);
    hydrated.current = true;
  }, [isLoaded, isSignedIn, storageKey]);

  // Persistér bare når vi har nøkkel (innlogget)
  useEffect(() => {
    if (hydrated.current && storageKey) writeLS(storageKey, budgets);
  }, [storageKey, budgets]);

  // Hent fra API og merg (kun innlogget)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/budgets", {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Fetch budgets failed");
        const server = await res.json(); // [{..., id, mongoId}]
        setBudgets((prev) => {
          const byId = new Map(prev.map((b) => [b.id, b]));
          for (const s of server)
            byId.set(s.id, { ...(byId.get(s.id) || {}), ...s });
          return Array.from(byId.values());
        });
      } catch (e) {
        if (e.name !== "AbortError")
          console.warn("Using local only (API offline?)", e);
      }
    })();
    return () => ac.abort();
  }, [isLoaded, isSignedIn, storageKey]);

  // Sync lokale uten mongoId (kun innlogget)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      const toSync = budgets.filter((b) => b && b.id && !b.mongoId);
      for (const b of toSync) {
        try {
          const r = await fetch("/api/budgets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(b),
          });
          if (!r.ok) continue;
          const saved = await r.json();
          setBudgets((prev) =>
            prev.map((x) =>
              x.id === b.id ? { ...x, mongoId: saved.mongoId } : x
            )
          );
        } catch {}
      }
    })();
  }, [isLoaded, isSignedIn, budgets]);

  const requireAuth = () => {
    if (!isLoaded || !isSignedIn) {
      console.warn("Not signed in: writes are blocked");
      return false;
    }
    return true;
  };

  // === Helpers ===
  const addBudget = async (budgetInput) => {
    if (!requireAuth()) return;
    const budget = {
      id: budgetInput.id || Date.now(),
      ...budgetInput,
      ...(budgetInput.tripId != null
        ? { tripId: Number(budgetInput.tripId) }
        : {}),
    };
    setBudgets((prev) => [...prev, budget]);

    try {
      const r = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      });
      if (!r.ok) throw new Error("POST failed");
      const saved = await r.json();
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === budget.id ? { ...b, mongoId: saved.mongoId } : b
        )
      );
    } catch (e) {
      console.error("addBudget failed", e);
    }
  };

  const updateBudget = async (id, updatedData) => {
    if (!requireAuth()) return;
    const patch = {
      ...updatedData,
      ...(updatedData.tripId != null
        ? { tripId: Number(updatedData.tripId) }
        : {}),
    };
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );

    const target = budgets.find((b) => b.id === id);
    const mongoId = target?.mongoId;
    try {
      if (mongoId) {
        const r = await fetch(`/api/budgets/${mongoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...patch }),
        });
        if (!r.ok) throw new Error("PUT failed");
      } else {
        const r = await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...patch }),
        });
        if (!r.ok) throw new Error("POST (no mongoId) failed");
        const saved = await r.json();
        setBudgets((prev) =>
          prev.map((b) => (b.id === id ? { ...b, mongoId: saved.mongoId } : b))
        );
      }
    } catch (e) {
      console.error("updateBudget failed", e);
    }
  };

  const deleteBudget = async (id) => {
    if (!requireAuth()) return;
    const target = budgets.find((b) => b.id === id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    if (!target?.mongoId) return;

    try {
      const r = await fetch(`/api/budgets/${target.mongoId}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error("DELETE failed");
    } catch (e) {
      console.error("deleteBudget failed", e);
    }
  };

  return (
    <BudgetContext.Provider
      value={{ budgets, addBudget, deleteBudget, updateBudget, isSignedIn }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export const useBudget = () => useContext(BudgetContext);

/*
BudgetContext — offline-først budsjett med trygg synk

• Kilde for alle budsjetter (typisk 1 pr. tripId). Lagres alltid i localStorage.
• Ved mount:
   1) Hydrer fra localStorage.
   2) Hent fra /api/budgets og MERGE inn (behold din numeriske id, ta med mongoId/oppdaterte felter).
   3) Synk alle lokale budsjett som mangler mongoId via POST (engang etter merge).

• addBudget(input)
   – Optimistisk legg til (id = Date.now() hvis mangler, tripId castes til Number).
   – POST til /api/budgets, lagre mongoId i state ved suksess.

• updateBudget(id, patch)
   – Optimistisk oppdater lokalt.
   – PUT til /api/budgets/:mongoId når vi har mongoId.
   – Ellers POST (upsert) til /api/budgets og lagre mongoId i state.

• deleteBudget(id)
   – Optimistisk slett lokalt.
   – Hvis mongoId finnes: DELETE /api/budgets/:mongoId (ellers kun lokal sletting).

Forventet shape:
{
  id: number,            // din stabile, numeriske id
  mongoId?: string,      // MongoDB ObjectId (fra server)
  tripId: number,        // hvilket reisekort dette budsjettet tilhører
  amount?: number,       // totalbudsjett
  daily?: number,        // daglig budsjett (valgfritt)
  transport?: number,
  accommodation?: number,
  food?: number,
  activities?: number,
  other?: number,
  currency?: string,     // f.eks. 'NOK'
  notes?: string
}

Bruk:
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudget();

Sorterings-/unikhetslogikk håndteres i UI (f.eks. én pr. tripId), mens Context sørger for
robust offline-først flyt og sikker server-synk når nett finnes.
*/
