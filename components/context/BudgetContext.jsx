"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const BudgetContext = createContext();

// LS helpers m/ nøkkel
function saveLS(key, budgets) {
  try {
    localStorage.setItem(key, JSON.stringify(budgets));
  } catch {}
}
function loadLS(key) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function BudgetProvider({ children }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const storageKey =
    isLoaded && isSignedIn ? `budgets:${userId}` : "budgets:guest";

  const [budgets, setBudgets] = useState([]);
  const hasHydrated = useRef(false);

  // 1) Hydrer når nøkkel endres (inn/ut av konto)
  useEffect(() => {
    if (!isLoaded) return;
    setBudgets(loadLS(storageKey));
    hasHydrated.current = true;
  }, [isLoaded, storageKey]);

  // 2) Persistér til localStorage
  useEffect(() => {
    if (hasHydrated.current) saveLS(storageKey, budgets);
  }, [storageKey, budgets]);

  // 3) Hent fra API (kun innlogget) og merg inn
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
        const server = await res.json(); // [{..., id (din numeriske), mongoId}]
        setBudgets((prev) => {
          const byId = new Map(prev.map((b) => [b.id, b]));
          server.forEach((s) => {
            const curr = byId.get(s.id);
            if (curr) byId.set(s.id, { ...curr, ...s });
            else byId.set(s.id, s);
          });
          return Array.from(byId.values());
        });
      } catch (e) {
        if (e.name !== "AbortError")
          console.warn("Using local budgets only (API offline?)", e);
      }
    })();

    return () => ac.abort();
  }, [isLoaded, isSignedIn, storageKey]);

  // 4) Sync lokale som mangler mongoId (kun innlogget)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      const toSync = budgets.filter((b) => b && b.id && !b.mongoId);
      if (!toSync.length) return;
      for (const b of toSync) {
        try {
          const res = await fetch("/api/budgets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(b),
          });
          if (!res.ok) throw new Error("sync POST failed");
          const saved = await res.json();
          setBudgets((prev) =>
            prev.map((x) =>
              x.id === b.id ? { ...x, mongoId: saved.mongoId } : x
            )
          );
        } catch (e) {
          console.warn("Sync of budget failed", b.id, e);
        }
      }
    })();
  }, [isLoaded, isSignedIn, budgets]);

  // ===== API helpers (optimistic) =====
  const addBudget = async (budgetInput) => {
    const budget = {
      id: budgetInput.id || Date.now(),
      ...budgetInput,
      ...(budgetInput.tripId != null
        ? { tripId: Number(budgetInput.tripId) }
        : {}),
    };

    setBudgets((prev) => [...prev, budget]);

    if (!isLoaded || !isSignedIn) return; // ingen nett-kall som gjest

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      });
      if (!res.ok) throw new Error("POST failed");
      const saved = await res.json();
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === budget.id ? { ...b, mongoId: saved.mongoId } : b
        )
      );
    } catch (e) {
      console.error("addBudget: server failed, kept locally", e);
    }
  };

  const updateBudget = async (id, updatedData) => {
    const patch = {
      ...updatedData,
      ...(updatedData.tripId != null
        ? { tripId: Number(updatedData.tripId) }
        : {}),
    };

    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );

    if (!isLoaded || !isSignedIn) return;

    const target = budgets.find((b) => b.id === id);
    const mongoId = target?.mongoId;

    try {
      if (mongoId) {
        const res = await fetch(`/api/budgets/${mongoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...patch }),
        });
        if (!res.ok) throw new Error("PUT failed");
      } else {
        const res = await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...patch }),
        });
        if (!res.ok) throw new Error("POST (no mongoId) failed");
        const saved = await res.json();
        setBudgets((prev) =>
          prev.map((b) => (b.id === id ? { ...b, mongoId: saved.mongoId } : b))
        );
      }
    } catch (e) {
      console.error("updateBudget: server failed, kept local state", e);
    }
  };

  const deleteBudget = async (id) => {
    const target = budgets.find((b) => b.id === id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));

    if (!isLoaded || !isSignedIn || !target?.mongoId) return;

    try {
      const res = await fetch(`/api/budgets/${target.mongoId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("DELETE failed");
    } catch (e) {
      console.error("deleteBudget: server failed, but removed locally", e);
    }
  };

  return (
    <BudgetContext.Provider
      value={{ budgets, addBudget, deleteBudget, updateBudget }}
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
