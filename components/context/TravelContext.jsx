"use client";
import { createContext, useState, useContext } from "react";

// 1. Lag konteksten
const TravelContext = createContext();

// 2. Lag en provider-komponent
export const TravelProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);

  const addTrip = (newTrip) => {
    setTrips((prev) => [...prev, newTrip]);
  };

  return (
    <TravelContext.Provider value={{ trips, addTrip }}>
      {children}
    </TravelContext.Provider>
  );
};

// 3. Egen hook for lettere bruk
export const useTravel = () => useContext(TravelContext);


// Dette gir deg en global "reisestorage" du kan bruke på tvers av Dashboard, TravelForm, osv.