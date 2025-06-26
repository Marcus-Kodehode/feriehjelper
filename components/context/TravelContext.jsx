"use client";
import { createContext, useContext, useState, useEffect } from "react";

const TravelContext = createContext();

export function TravelProvider({ children }) {
  const [trips, setTrips] = useState([]);

  // 👉 Hent fra localStorage én gang når appen starter
  useEffect(() => {
    const lagrede = localStorage.getItem("trips");
    if (lagrede) {
      setTrips(JSON.parse(lagrede));
    }
  }, []);

  // 👉 Lagre til localStorage hver gang trips endres
  useEffect(() => {
    localStorage.setItem("trips", JSON.stringify(trips));
  }, [trips]);

  const addTrip = (trip) => {
    setTrips((prev) => [...prev, trip]);
  };

  const deleteTrip = (id) => {
    setTrips((prev) => prev.filter((trip) => trip.id !== id));
  };

  return (
    <TravelContext.Provider value={{ trips, addTrip, deleteTrip }}>
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  return useContext(TravelContext);
}



// Dette gir deg en global "reisestorage" du kan bruke på tvers av Dashboard, TravelForm, osv.