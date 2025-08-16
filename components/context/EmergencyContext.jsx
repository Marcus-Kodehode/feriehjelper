"use client";
import { createContext, useContext, useState, useEffect } from "react";

const EmergencyContext = createContext();

export function EmergencyProvider({ children }) {
  const [emergencies, setEmergencies] = useState([]);

  // load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("emergencyData");
    if (stored) setEmergencies(JSON.parse(stored));
  }, []);

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem("emergencyData", JSON.stringify(emergencies));
  }, [emergencies]);

  // add or replace by tripId
  const addEmergency = (newData) => {
    const parsed = {
      ...newData,
      id: newData.id || Date.now(),
      tripId: Number(newData.tripId),
    };
    setEmergencies((prev) => {
      const updated = prev.filter((e) => e.tripId !== parsed.tripId);
      return [...updated, parsed];
    });
  };

  // 👇 edit by id (used when you click “Rediger”)
  const updateEmergency = (id, patch) => {
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...patch, tripId: Number(patch.tripId ?? e.tripId) } : e
      )
    );
  };

  const deleteEmergency = (id) => {
    setEmergencies((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <EmergencyContext.Provider
      value={{ emergencies, addEmergency, updateEmergency, deleteEmergency }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export const useEmergency = () => useContext(EmergencyContext);

// EmergencyContext håndterer nødinformasjon for hver reise (ambassade, politi, forsikring osv).
// Data lagres og hentes automatisk til/fra localStorage for vedvarende tilgang.
// addEmergency oppdaterer eller legger til info per reise (basert på tripId).
// deleteEmergency fjerner en post basert på ID.
// Tilstanden deles globalt via EmergencyProvider og brukes med useEmergency().
