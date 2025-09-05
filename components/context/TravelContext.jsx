"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";

const TravelContext = createContext(null);

// safe LS helpers
const readLS = (key) => {
  try {
    return key ? JSON.parse(localStorage.getItem(key) || "[]") : [];
  } catch {
    return [];
  }
};
const writeLS = (key, value) => {
  try {
    if (key) localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export function TravelProvider({ children }) {
  const { isLoaded, isSignedIn, userId } = useAuth();

  // Kun lagre/lese når innlogget – ellers ingen nøkkel => ingen data
  const storageKey = useMemo(
    () => (isLoaded && isSignedIn ? `trips:${userId}` : null),
    [isLoaded, isSignedIn, userId]
  );

  const [trips, setTrips] = useState([]);
  const hydrated = useRef(false);

  // 1) Hydrer når auth/status/nøkkel endres
  useEffect(() => {
    if (!isLoaded) return;
    setTrips(storageKey ? readLS(storageKey) : []); // utlogget => tom liste
    hydrated.current = true;
  }, [isLoaded, storageKey]);

  // 2) Persistér kun når vi har en bruker-spesifikk nøkkel
  useEffect(() => {
    if (hydrated.current && storageKey) writeLS(storageKey, trips);
  }, [storageKey, trips]);

  // 3) Hent fra API og MERGE (kun når innlogget)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const ctrl = new AbortController();

    (async () => {
      try {
        const r = await fetch("/api/trips", {
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (!r.ok) throw new Error("Fetch trips failed");
        const server = await r.json(); // [{..., id, mongoId}]
        setTrips((prev) => {
          const byId = new Map(prev.map((t) => [t.id, t]));
          for (const s of server) {
            byId.set(s.id, { ...(byId.get(s.id) || {}), ...s });
          }
          return Array.from(byId.values()).sort(
            (a, b) => new Date(a.from) - new Date(b.from)
          );
        });
      } catch (e) {
        if (e.name !== "AbortError")
          console.warn("Using local only (API offline?)", e);
      }
    })();

    return () => ctrl.abort();
  }, [isLoaded, isSignedIn, storageKey]);

  // 4) Sync lokale uten mongoId (kun når innlogget)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      const toSync = trips.filter((t) => t && t.id && !t.mongoId);
      for (const t of toSync) {
        try {
          const r = await fetch("https://feriehjelper.vercel.app/api/trips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(t),
          });
          if (!r.ok) continue;
          const saved = await r.json();
          setTrips((prev) =>
            prev.map((x) =>
              x.id === t.id ? { ...x, mongoId: saved.mongoId } : x
            )
          );
        } catch {}
      }
    })();
  }, [isLoaded, isSignedIn, trips]);

  // Hjelper: blokker skriv hvis ikke innlogget
  const requireAuth = () => {
    if (!isLoaded || !isSignedIn) {
      console.warn("Not signed in: writes are blocked");
      return false;
    }
    return true;
  };

  // ==== API helpers (optimistic, men krever innlogging) ====
  const addTrip = async (tripInput) => {
    if (!requireAuth()) return;
    const trip = { id: tripInput.id || Date.now(), ...tripInput };
    setTrips((prev) => [...prev, trip]);

    try {
      const r = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      });
      if (!r.ok) throw new Error("POST failed");
      const saved = await r.json();
      setTrips((prev) =>
        prev.map((t) =>
          t.id === trip.id ? { ...t, mongoId: saved.mongoId } : t
        )
      );
    } catch (e) {
      console.error("addTrip failed", e);
    }
  };

  const editTrip = async (updatedTrip) => {
    if (!requireAuth()) return;
    setTrips((prev) =>
      prev.map((t) => (t.id === updatedTrip.id ? { ...t, ...updatedTrip } : t))
    );

    const current = trips.find((t) => t.id === updatedTrip.id);
    const mongoId = current?.mongoId;

    try {
      if (mongoId) {
        const r = await fetch(`/api/trips/${mongoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTrip),
        });
        if (!r.ok) throw new Error("PUT failed");
      } else {
        const r = await fetch("/api/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTrip),
        });
        if (!r.ok) throw new Error("POST (no mongoId) failed");
        const saved = await r.json();
        setTrips((prev) =>
          prev.map((t) =>
            t.id === updatedTrip.id ? { ...t, mongoId: saved.mongoId } : t
          )
        );
      }
    } catch (e) {
      console.error("editTrip failed", e);
    }
  };

  const deleteTrip = async (id) => {
    if (!requireAuth()) return;
    const target = trips.find((t) => t.id === id);
    setTrips((prev) => prev.filter((t) => t.id !== id));

    try {
      if (target?.mongoId) {
        const r = await fetch(`/api/trips/${target.mongoId}`, {
          method: "DELETE",
        });
        if (!r.ok) throw new Error("DELETE by mongoId failed");
      } else {
        const r = await fetch(`/api/trips/local/${id}`, { method: "DELETE" });
        if (!r.ok) throw new Error("DELETE by localId failed");
      }
    } catch (e) {
      console.error("deleteTrip failed", e);
    }
  };

  const value = useMemo(
    () => ({ trips, addTrip, editTrip, deleteTrip, isSignedIn }),
    [trips, isSignedIn]
  );

  return (
    <TravelContext.Provider value={value}>{children}</TravelContext.Provider>
  );
}

export const useTravel = () => useContext(TravelContext);

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
