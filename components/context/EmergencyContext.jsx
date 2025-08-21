"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const EmergencyContext = createContext();

function saveLS(items) {
  try { localStorage.setItem("emergencyData", JSON.stringify(items)); } catch {}
}
function loadLS() {
  try {
    const s = localStorage.getItem("emergencyData");
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export function EmergencyProvider({ children }) {
  const [emergencies, setEmergencies] = useState([]);
  const hasHydrated = useRef(false);

  // 1) Hydrer fra localStorage
  useEffect(() => {
    setEmergencies(loadLS());
    hasHydrated.current = true;
  }, []);

  // 2) Persistér til localStorage
  useEffect(() => { if (hasHydrated.current) saveLS(emergencies); }, [emergencies]);

  // 3) Hent fra API og merg (behold egen numerisk id; ta inn mongoId)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/emergencies", { cache: "no-store" });
        if (!res.ok) throw new Error("Fetch emergencies failed");
        const server = await res.json(); // [{..., id, tripId, mongoId}]
        setEmergencies((prev) => {
          const byId = new Map(prev.map((e) => [e.id, e]));
          server.forEach((s) => {
            const curr = byId.get(s.id);
            if (curr) byId.set(s.id, { ...curr, ...s });
            else byId.set(s.id, s);
          });
          return Array.from(byId.values());
        });
      } catch (e) {
        console.warn("Using local emergencies only (API offline?)", e);
      }
    })();
  }, []);

  // 4) Sync lokale uten mongoId (én per tripId)
  useEffect(() => {
    (async () => {
      const toSync = emergencies.filter((e) => e && e.id && !e.mongoId);
      if (!toSync.length) return;
      for (const e of toSync) {
        try {
          const res = await fetch("/api/emergencies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(e),
          });
          if (!res.ok) throw new Error("sync POST failed");
          const saved = await res.json(); // { ...e, mongoId }
          setEmergencies((prev) =>
            prev.map((x) => (x.id === e.id ? { ...x, mongoId: saved.mongoId } : x))
          );
        } catch (err) {
          console.warn("Sync of emergency failed", e.id, err);
        }
      }
    })();
  }, [emergencies]);

  // ===== API helpers (optimistic) =====

  // add/replace by tripId
  const addEmergency = async (newData) => {
    const parsed = {
      ...newData,
      id: newData.id || Date.now(),
      tripId: Number(newData.tripId),
    };

    // lokalt: én per tripId
    setEmergencies((prev) => {
      const others = prev.filter((e) => Number(e.tripId) !== parsed.tripId);
      return [...others, parsed];
    });

    // server: upsert by tripId (implementert i API)
    try {
      const res = await fetch("/api/emergencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) throw new Error("POST failed");
      const saved = await res.json();
      setEmergencies((prev) =>
        prev.map((e) => (e.id === parsed.id ? { ...e, mongoId: saved.mongoId } : e))
      );
    } catch (e) {
      console.error("addEmergency: server failed, kept locally", e);
    }
  };

  const updateEmergency = async (id, patch) => {
    // normaliser tripId hvis endres
    const norm = { ...patch };
    if (norm.tripId != null) norm.tripId = Number(norm.tripId);

    setEmergencies((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...norm } : e))
    );

    const target = emergencies.find((e) => e.id === id);
    const mongoId = target?.mongoId;

    try {
      if (mongoId) {
        const res = await fetch(`/api/emergencies/${mongoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...norm }),
        });
        if (!res.ok) throw new Error("PUT failed");
      } else {
        const res = await fetch("/api/emergencies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...norm }),
        });
        if (!res.ok) throw new Error("POST (no mongoId) failed");
        const saved = await res.json();
        setEmergencies((prev) =>
          prev.map((e) => (e.id === id ? { ...e, mongoId: saved.mongoId } : e))
        );
      }
    } catch (e) {
      console.error("updateEmergency: server failed, kept local state", e);
    }
  };

  const deleteEmergency = async (id) => {
    const target = emergencies.find((e) => e.id === id);
    setEmergencies((prev) => prev.filter((e) => e.id !== id));
    if (!target?.mongoId) return;

    try {
      const res = await fetch(`/api/emergencies/${target.mongoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("DELETE failed");
    } catch (e) {
      console.error("deleteEmergency: server failed, but removed locally", e);
    }
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
