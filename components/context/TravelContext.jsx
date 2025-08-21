"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const TravelContext = createContext();

function saveLS(trips) {
  try { localStorage.setItem("trips", JSON.stringify(trips)); } catch {}
}
function loadLS() {
  try {
    const s = localStorage.getItem("trips");
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function TravelProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const hasHydrated = useRef(false);

  // 1) Hydrer fra localStorage umiddelbart
  useEffect(() => {
    setTrips(loadLS());
    hasHydrated.current = true;
  }, []);

  // 2) Persistér til localStorage ved endringer
  useEffect(() => {
    if (hasHydrated.current) saveLS(trips);
  }, [trips]);

  // 3) Hent fra API og merg inn (uten å ødelegge lokale)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/trips", { cache: "no-store" });
        if (!res.ok) throw new Error("Fetch trips failed");
        const server = await res.json(); // [{..., id, mongoId }]
        setTrips((prev) => {
          const byId = new Map(prev.map((t) => [t.id, t]));
          server.forEach((s) => {
            const current = byId.get(s.id);
            if (current) byId.set(s.id, { ...current, ...s });
            else byId.set(s.id, s);
          });
          return Array.from(byId.values()).sort(
            (a, b) => new Date(a.from) - new Date(b.from)
          );
        });
      } catch (e) {
        console.warn("Using local trips only (API offline?)", e);
      }
    })();
  }, []);

  // 4) Sync opp lokale trips som mangler mongoId
  useEffect(() => {
    (async () => {
      const toSync = trips.filter((t) => t && t.id && !t.mongoId);
      if (!toSync.length) return;
      for (const t of toSync) {
        try {
          const res = await fetch("/api/trips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(t),
          });
          if (!res.ok) throw new Error("sync POST failed");
          const saved = await res.json();
          setTrips((prev) =>
            prev.map((x) => (x.id === t.id ? { ...x, mongoId: saved.mongoId } : x))
          );
        } catch (e) {
          console.warn("Sync of trip failed", t.id, e);
        }
      }
    })();
  }, [trips]);

  // API helpers (optimistic)
  const addTrip = async (tripInput) => {
    const trip = { id: tripInput.id || Date.now(), ...tripInput };
    setTrips((prev) => [...prev, trip]);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      });
      if (!res.ok) throw new Error("POST failed");
      const saved = await res.json();
      setTrips((prev) =>
        prev.map((t) => (t.id === trip.id ? { ...t, mongoId: saved.mongoId } : t))
      );
    } catch (e) {
      console.error("addTrip: server failed, kept locally", e);
    }
  };

  const editTrip = async (updatedTrip) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === updatedTrip.id ? { ...t, ...updatedTrip } : t))
    );
    const target = trips.find((t) => t.id === updatedTrip.id);
    const mongoId = target?.mongoId;
    try {
      if (mongoId) {
        const res = await fetch(`/api/trips/${mongoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTrip),
        });
        if (!res.ok) throw new Error("PUT failed");
      } else {
        const res = await fetch("/api/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTrip),
        });
        if (!res.ok) throw new Error("POST (no mongoId) failed");
        const saved = await res.json();
        setTrips((prev) =>
          prev.map((t) =>
            t.id === updatedTrip.id ? { ...t, mongoId: saved.mongoId } : t
          )
        );
      }
    } catch (e) {
      console.error("editTrip: server failed, kept local state", e);
    }
  };

  const deleteTrip = async (id) => {
    const target = trips.find((t) => t.id === id);
    setTrips((prev) => prev.filter((t) => t.id !== id)); // optimistisk

    try {
      if (target?.mongoId) {
        const res = await fetch(`/api/trips/${target.mongoId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("DELETE by mongoId failed");
      } else {
        const res = await fetch(`/api/trips/local/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("DELETE by localId failed");
      }
    } catch (e) {
      console.error("deleteTrip: server delete failed, but removed locally", e);
    }
  };

  // 🔧 DENNE MÅ VÆRE MED
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
