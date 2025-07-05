"use client";
import { createContext, useContext, useState, useEffect } from "react";

// 1. Opprett context
const EmergencyContext = createContext();

// 2. Provider-komponent
export function EmergencyProvider({ children }) {
  const [emergencies, setEmergencies] = useState([]);

  // Hent fra localStorage ved oppstart
  useEffect(() => {
    const stored = localStorage.getItem("emergencyData");
    if (stored) {
      setEmergencies(JSON.parse(stored));
    }
  }, []);

  // Lagre til localStorage ved endring
  useEffect(() => {
    localStorage.setItem("emergencyData", JSON.stringify(emergencies));
  }, [emergencies]);

  // Legg til eller oppdater nødinformasjon
  const addEmergency = (newData) => {
    const parsedData = {
      ...newData,
      id: newData.id || Date.now(), // 👈 genererer unik ID hvis den mangler
      tripId: Number(newData.tripId), // sikre talltype
    };

    setEmergencies((prev) => {
      const updated = prev.filter((e) => e.tripId !== parsedData.tripId);
      return [...updated, parsedData];
    });
  };

  // Slett etter ID
  const deleteEmergency = (id) => {
    setEmergencies((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <EmergencyContext.Provider
      value={{
        emergencies,
        addEmergency,
        deleteEmergency, // 👈 husk å eksponere den!
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

// 3. Custom hook
export const useEmergency = () => useContext(EmergencyContext);

// EmergencyContext håndterer nødinformasjon for hver reise (ambassade, politi, forsikring osv).
// Data lagres og hentes automatisk til/fra localStorage for vedvarende tilgang.
// addEmergency oppdaterer eller legger til info per reise (basert på tripId).
// deleteEmergency fjerner en post basert på ID.
// Tilstanden deles globalt via EmergencyProvider og brukes med useEmergency().
