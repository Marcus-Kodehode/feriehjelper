'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const BudgetContext = createContext();

export function BudgetProvider({ children }) {
  const [budgets, setBudgets] = useState([]);

  // Hent fra localStorage ved oppstart
  useEffect(() => {
    const lagret = localStorage.getItem('budgets');
    if (lagret) {
      setBudgets(JSON.parse(lagret));
    }
  }, []);

  // Oppdater localStorage når budgets endres
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Legg til nytt budsjett
  const addBudget = (budget) => {
    setBudgets((prev) => [...prev, budget]);
  };

  // Slett budsjett
  const deleteBudget = (id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Rediger budsjett
  const updateBudget = (id, updatedData) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedData } : b))
    );
  };

  return (
    <BudgetContext.Provider
      value={{ budgets, addBudget, deleteBudget, updateBudget }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

// Hook for å bruke context
export const useBudget = () => useContext(BudgetContext);

// BudgetContext håndterer budsjetter knyttet til reiser i appen.
// Budsjettene lastes inn og lagres automatisk i localStorage.
// Funksjoner: addBudget (legg til), deleteBudget (fjern), updateBudget (rediger).
// Data er tilgjengelig globalt via BudgetProvider og kan brukes med useBudget().
