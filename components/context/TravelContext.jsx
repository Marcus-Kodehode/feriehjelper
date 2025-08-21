"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const TravelContext = createContext();

function saveLS(trips) {
  try {
    localStorage.setItem("trips", JSON.stringify(trips));
  } catch {}
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
        const server = await res.json(); // [{..., id (din numeriske hvis du lagret den), mongoId }]
        setTrips((prev) => {
          // Slå sammen: behold numerisk id; ta inn mongoId/oppdaterte felt fra server
          const byId = new Map(prev.map((t) => [t.id, t]));
          server.forEach((s) => {
            const current = byId.get(s.id);
            if (current) {
              byId.set(s.id, { ...current, ...s }); // tar med mongoId uten å miste lokale felter
            } else {
              byId.set(s.id, s); // ny fra server
            }
          });
          const merged = Array.from(byId.values()).sort(
            (a, b) => new Date(a.from) - new Date(b.from)
          );
          return merged;
        });
      } catch (e) {
        // stille fallback: behold localStorage-verdier
        console.warn("Using local trips only (API offline?)", e);
      }
    })();
  }, []);

  // 4) Sync opp lokale trips som mangler mongoId (engang etter mount/merge)
  useEffect(() => {
    (async () => {
      const toSync = trips.filter((t) => t && t.id && !t.mongoId);
      if (!toSync.length) return;
      for (const t of toSync) {
        try {
          const res = await fetch("/api/trips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(t), // inkluderer din numeriske id
          });
          if (!res.ok) throw new Error("sync POST failed");
          const saved = await res.json(); // forventer { ...t, mongoId }
          setTrips((prev) =>
            prev.map((x) => (x.id === t.id ? { ...x, mongoId: saved.mongoId } : x))
          );
        } catch (e) {
          console.warn("Sync of trip failed", t.id, e);
        }
      }
    })();
    // Kjør når trips endres (typisk etter server-merge)
  }, [trips]);

  // API helpers (optimistic)

  const addTrip = async (tripInput) => {
    // sørg for numerisk id lokalt
    const trip = { id: tripInput.id || Date.now(), ...tripInput };
    setTrips((prev) => [...prev, trip]);

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      });
      if (!res.ok) throw new Error("POST failed");
      const saved = await res.json(); // { ...trip, mongoId }
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

    // Hvis vi har mongoId -> PUT, ellers prøv å sync’e ved å POST’e (upsert-løst)
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
    setTrips((prev) => prev.filter((t) => t.id !== id));

    if (!target?.mongoId) return; // kun lokal sletting hvis ingen server-id

    try {
      const res = await fetch(`/api/trips/${target.mongoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("DELETE failed");
    } catch (e) {
      console.error("deleteTrip: server failed, but removed locally", e);
    }
  };

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
