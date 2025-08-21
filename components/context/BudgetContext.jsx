"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const BudgetContext = createContext();

function saveLS(budgets) {
  try {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  } catch {}
}
function loadLS() {
  try {
    const s = localStorage.getItem("budgets");
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function BudgetProvider({ children }) {
  const [budgets, setBudgets] = useState([]);
  const hasHydrated = useRef(false);

  // 1) Hydrer fra localStorage
  useEffect(() => {
    setBudgets(loadLS());
    hasHydrated.current = true;
  }, []);

  // 2) Persistér til localStorage
  useEffect(() => {
    if (hasHydrated.current) saveLS(budgets);
  }, [budgets]);

  // 3) Hent fra API og merg inn (behold din egen numeriske id; ta inn mongoId/felt fra server)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/budgets", { cache: "no-store" });
        if (!res.ok) throw new Error("Fetch budgets failed");
        const server = await res.json(); // [{..., id (din numeriske), mongoId }]
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
        console.warn("Using local budgets only (API offline?)", e);
      }
    })();
  }, []);

  // 4) Sync opp lokale som mangler mongoId (engangs etter merge)
  useEffect(() => {
    (async () => {
      const toSync = budgets.filter((b) => b && b.id && !b.mongoId);
      if (!toSync.length) return;
      for (const b of toSync) {
        try {
          const res = await fetch("/api/budgets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(b), // inkluderer din numeriske id
          });
          if (!res.ok) throw new Error("sync POST failed");
          const saved = await res.json(); // { ...b, mongoId }
          setBudgets((prev) =>
            prev.map((x) => (x.id === b.id ? { ...x, mongoId: saved.mongoId } : x))
          );
        } catch (e) {
          console.warn("Sync of budget failed", b.id, e);
        }
      }
    })();
  }, [budgets]);

  // ==== API helpers (optimistic) ====

  // Legg til nytt budsjett
  const addBudget = async (budgetInput) => {
    // egen numerisk id lokalt + sørg for numeric tripId om du bruker det
    const budget = {
      id: budgetInput.id || Date.now(),
      ...budgetInput,
      tripId: Number(budgetInput.tripId ?? budgetInput.tripId),
    };

    setBudgets((prev) => [...prev, budget]);

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      });
      if (!res.ok) throw new Error("POST failed");
      const saved = await res.json(); // { ...budget, mongoId }
      setBudgets((prev) =>
        prev.map((b) => (b.id === budget.id ? { ...b, mongoId: saved.mongoId } : b))
      );
    } catch (e) {
      console.error("addBudget: server failed, kept locally", e);
    }
  };

  // Rediger budsjett
  const updateBudget = async (id, updatedData) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedData } : b))
    );

    const target = budgets.find((b) => b.id === id);
    const mongoId = target?.mongoId;

    try {
      if (mongoId) {
        const res = await fetch(`/api/budgets/${mongoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...updatedData }),
        });
        if (!res.ok) throw new Error("PUT failed");
      } else {
        const res = await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...updatedData }),
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

  // Slett budsjett
  const deleteBudget = async (id) => {
    const target = budgets.find((b) => b.id === id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    if (!target?.mongoId) return;

    try {
      const res = await fetch(`/api/budgets/${target.mongoId}`, { method: "DELETE" });
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
