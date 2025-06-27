"use client";
import { createContext, useContext, useState, useEffect } from "react";

const TravelContext = createContext();

export function TravelProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [budgets, setBudgets] = useState([]);

  // 👉 Hent lagret data ved oppstart
  useEffect(() => {
    const lagredeTrips = localStorage.getItem("trips");
    if (lagredeTrips) setTrips(JSON.parse(lagredeTrips));

    const lagredeBudgets = localStorage.getItem("budgets");
    if (lagredeBudgets) setBudgets(JSON.parse(lagredeBudgets));
  }, []);

  // 👉 Lagre til localStorage når trips eller budgets endres
  useEffect(() => {
    localStorage.setItem("trips", JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);

  // Reiser
  const addTrip = (trip) => setTrips((prev) => [...prev, trip]);
  const deleteTrip = (id) => setTrips((prev) => prev.filter((trip) => trip.id !== id));

  // Budsjett
  const addBudget = (budget) => setBudgets((prev) => [...prev, budget]);

  return (
    <TravelContext.Provider value={{ trips, addTrip, deleteTrip, budgets, addBudget }}>
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  return useContext(TravelContext);
}



// Dette gir deg en global "reisestorage" du kan bruke på tvers av Dashboard, TravelForm, osv.