"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const TravelContext = createContext();

// LS helpers med nøkkel
function saveLS(key, trips) {
  try {
    localStorage.setItem(key, JSON.stringify(trips));
  } catch {}
}
function loadLS(key) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function TravelProvider({ children }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const storageKey = isLoaded && isSignedIn ? `trips:${userId}` : "trips:guest";

  const [trips, setTrips] = useState([]);
  const hasHydrated = useRef(false);

  // 1) Hydrer når storageKey endres (bytte bruker / inn-ut logging)
  useEffect(() => {
    if (!isLoaded) return; // vent til Clerk er klar
    setTrips(loadLS(storageKey));
    hasHydrated.current = true;
  }, [isLoaded, storageKey]);

  // 2) Persistér til localStorage
  useEffect(() => {
    if (hasHydrated.current) saveLS(storageKey, trips);
  }, [storageKey, trips]);

  // 3) Hent fra API og merg (kun når innlogget)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/trips", {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Fetch trips failed");
        const server = await res.json(); // [{..., id, mongoId}]
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
        if (e.name !== "AbortError")
          console.warn("Using local trips only (API offline?)", e);
      }
    })();

    return () => ac.abort();
  }, [isLoaded, isSignedIn, storageKey]);

  // 4) Sync lokale trips som mangler mongoId (kun når innlogget)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
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
            prev.map((x) =>
              x.id === t.id ? { ...x, mongoId: saved.mongoId } : x
            )
          );
        } catch (e) {
          console.warn("Sync of trip failed", t.id, e);
        }
      }
    })();
  }, [isLoaded, isSignedIn, trips]);

  // ==== API helpers (optimistic) ====
  const addTrip = async (tripInput) => {
    const trip = { id: tripInput.id || Date.now(), ...tripInput };
    setTrips((prev) => [...prev, trip]);

    // Ikke forsøk serverkall når ikke innlogget
    if (!isLoaded || !isSignedIn) return;

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      });
      if (!res.ok) throw new Error("POST failed");
      const saved = await res.json();
      setTrips((prev) =>
        prev.map((t) =>
          t.id === trip.id ? { ...t, mongoId: saved.mongoId } : t
        )
      );
    } catch (e) {
      console.error("addTrip: server failed, kept locally", e);
    }
  };

  const editTrip = async (updatedTrip) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === updatedTrip.id ? { ...t, ...updatedTrip } : t))
    );

    if (!isLoaded || !isSignedIn) return;

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

    if (!isLoaded || !isSignedIn) return;

    try {
      if (target?.mongoId) {
        const res = await fetch(`/api/trips/${target.mongoId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("DELETE by mongoId failed");
      } else {
        const res = await fetch(`/api/trips/local/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("DELETE by localId failed");
      }
    } catch (e) {
      console.error("deleteTrip: server delete failed, but removed locally", e);
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
/*
TravelContext — reiser, offline-først med trygg synk mot MongoDB

• Kilde for alle reiser (trips). Lagrer alltid i localStorage for kjapp oppstart/offline.
• Forventet modell:
  {
    id: number,         // din stabile, numeriske id (brukes som nøkkel i UI)
    mongoId?: string,   // MongoDB ObjectId (fra server)
    title: string,
    destination: string,
    from: string,       // ISO yyyy-mm-dd
    to: string,         // ISO yyyy-mm-dd
    transport?: string,
    stay?: string,
    travelers?: string|number,
    notes?: string,
    createdAt?: string, // satt server-side
    updatedAt?: string  // ev. satt server-side
  }

• Ved mount:
   1) Hydrer fra localStorage (rask og offline).
   2) Hent fra /api/trips og MERGE inn (behold din numeriske id; ta inn mongoId/oppdaterte felter).
   3) Synk lokale som mangler mongoId via POST (engangs etter merge).

• addTrip(input)
   – Gir elementet en lokal numerisk id hvis mangler.
   – Optimistisk legg til i state + POST /api/trips.
   – Ved suksess: lagre mongoId i state.

• editTrip(updated)
   – Optimistisk oppdater lokalt.
   – PUT /api/trips/:mongoId når vi kjenner mongoId.
   – Hvis ikke: POST /api/trips (opprett) og lagre mongoId.

• deleteTrip(id)
   – Optimistisk slett lokalt.
   – Hvis mongoId finnes: DELETE /api/trips/:mongoId.
   – Ellers (før synk): valgfri fallback DELETE /api/trips/local/:id (hvis endepunkt er implementert).

Bruk:
  const { trips, addTrip, editTrip, deleteTrip } = useTravel();

Merk:
  – “id” er din stabile nøkkel i UI. Server eksponerer MongoDBs _id som egen “mongoId”.
  – revalidate=0 + cache:"no-store" sikrer ferske API-data i utvikling.
*/
