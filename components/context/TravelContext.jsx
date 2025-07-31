"use client";
import { createContext, useContext, useState, useEffect } from "react";

const TravelContext = createContext();

export function TravelProvider({ children }) {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const lagredeTrips = localStorage.getItem("trips");
    if (lagredeTrips) setTrips(JSON.parse(lagredeTrips));
  }, []);

  useEffect(() => {
    localStorage.setItem("trips", JSON.stringify(trips));
  }, [trips]);

  const addTrip = (trip) => setTrips((prev) => [...prev, trip]);

  const deleteTrip = (id) =>
    setTrips((prev) => prev.filter((trip) => trip.id !== id));

  const editTrip = (updatedTrip) =>
    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === updatedTrip.id ? updatedTrip : trip
      )
    );

  return (
    <TravelContext.Provider value={{ trips, addTrip, deleteTrip, editTrip }}>
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  return useContext(TravelContext);
}

// TravelContext håndterer global tilstand for alle registrerte reiser i appen.
// Reiser lagres i localStorage, og hentes ved lasting av komponenten (via useEffect).
// Brukeren kan legge til og slette reiser med funksjonene addTrip og deleteTrip.
// Tilstanden deles globalt via TravelProvider, og hentes lokalt med useTravel().
// Dette gir enkel og sentralisert håndtering av reisedata på tvers av komponenter.
