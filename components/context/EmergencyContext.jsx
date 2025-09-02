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

const EmergencyContext = createContext(null);

// Safe LS utils
const readLS = (key) => {
  try {
    return key ? JSON.parse(localStorage.getItem(key) || "[]") : [];
  } catch {
    return [];
  }
};
const writeLS = (key, val) => {
  try {
    if (key) localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

export function EmergencyProvider({ children }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const storageKey = useMemo(
    () => (isLoaded && isSignedIn ? `emergencyData:${userId}` : null),
    [isLoaded, isSignedIn, userId]
  );

  const [emergencies, setEmergencies] = useState([]);
  const hydrated = useRef(false);

  // Hydrer ved inn/utlogging
  useEffect(() => {
    if (!isLoaded) return;
    // valgfritt: fjern gammel guest-cache
    try {
      if (!isSignedIn) localStorage.removeItem("emergencyData:guest");
    } catch {}
    setEmergencies(storageKey ? readLS(storageKey) : []);
    hydrated.current = true;
  }, [isLoaded, isSignedIn, storageKey]);

  // Persistér kun når vi har nøkkel (innlogget)
  useEffect(() => {
    if (hydrated.current && storageKey) writeLS(storageKey, emergencies);
  }, [storageKey, emergencies]);

  // Hent fra API og MERGE (kun innlogget)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/emergencies", {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Fetch emergencies failed");
        const server = await res.json();
        setEmergencies((prev) => {
          const byId = new Map(prev.map((e) => [e.id, e]));
          for (const s of server)
            byId.set(s.id, { ...(byId.get(s.id) || {}), ...s });
          return Array.from(byId.values());
        });
      } catch (e) {
        if (e.name !== "AbortError")
          console.warn("Using local only (API offline?)", e);
      }
    })();
    return () => ac.abort();
  }, [isLoaded, isSignedIn, storageKey]);

  // Sync lokale uten mongoId (kun innlogget)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      const toSync = emergencies.filter((e) => e && e.id && !e.mongoId);
      for (const e of toSync) {
        try {
          const r = await fetch("/api/emergencies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(e),
          });
          if (!r.ok) continue;
          const saved = await r.json();
          setEmergencies((prev) =>
            prev.map((x) =>
              x.id === e.id ? { ...x, mongoId: saved.mongoId } : x
            )
          );
        } catch {}
      }
    })();
  }, [isLoaded, isSignedIn, emergencies]);

  // Blokker skriv når ikke innlogget
  const requireAuth = () => {
    if (!isLoaded || !isSignedIn) {
      console.warn("Not signed in: writes are blocked");
      return false;
    }
    return true;
  };

  // === Helpers (optimistic, men krever innlogging) ===
  const addEmergency = async (newData) => {
    if (!requireAuth()) return;
    const parsed = {
      id: newData.id || Date.now(),
      tripId: Number(newData.tripId),
      ...newData,
    };
    // Én per tripId lokalt
    setEmergencies((prev) => {
      const others = prev.filter((e) => Number(e.tripId) !== parsed.tripId);
      return [...others, parsed];
    });

    try {
      const res = await fetch("/api/emergencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) throw new Error("POST failed");
      const saved = await res.json();
      setEmergencies((prev) =>
        prev.map((e) =>
          e.id === parsed.id ? { ...e, mongoId: saved.mongoId } : e
        )
      );
    } catch (e) {
      console.error("addEmergency failed", e);
    }
  };

  const updateEmergency = async (id, patch) => {
    if (!requireAuth()) return;
    const norm = { ...patch };
    if (norm.tripId != null) norm.tripId = Number(norm.tripId);

    setEmergencies((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...norm } : e))
    );

    const target = emergencies.find((e) => e.id === id);
    const mongoId = target?.mongoId;

    try {
      if (mongoId) {
        const r = await fetch(`/api/emergencies/${mongoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...norm }),
        });
        if (!r.ok) throw new Error("PUT failed");
      } else {
        const r = await fetch("/api/emergencies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...norm }),
        });
        if (!r.ok) throw new Error("POST (no mongoId) failed");
        const saved = await r.json();
        setEmergencies((prev) =>
          prev.map((e) => (e.id === id ? { ...e, mongoId: saved.mongoId } : e))
        );
      }
    } catch (e) {
      console.error("updateEmergency failed", e);
    }
  };

  const deleteEmergency = async (id) => {
    if (!requireAuth()) return;
    const target = emergencies.find((e) => e.id === id);
    setEmergencies((prev) => prev.filter((e) => e.id !== id));
    if (!target?.mongoId) return;

    try {
      const r = await fetch(`/api/emergencies/${target.mongoId}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error("DELETE failed");
    } catch (e) {
      console.error("deleteEmergency failed", e);
    }
  };

  return (
    <EmergencyContext.Provider
      value={{
        emergencies,
        addEmergency,
        updateEmergency,
        deleteEmergency,
        isSignedIn,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export const useEmergency = () => useContext(EmergencyContext);

/*
EmergencyContext — én nødinfo per reise, offline-først med trygg synk

• Kilde for all nødinformasjon. Lagrer alltid i localStorage.
• Forventet modell (én rad per tripId):
  {
    id: number,           // din stabile, numeriske id
    mongoId?: string,     // MongoDB ObjectId (fra server)
    tripId: number,       // hvilken reise dette gjelder (unik per reise)
    embassy?: string,     // adresse til ambassade/konsulat
    police?: string,
    ambulance?: string,
    fire?: string,
    insurance?: string,   // selskap
    policyNumber?: string,
    contactPerson?: string, // navn / nummer
    notes?: string,
    createdAt?: string,   // satt server-side
    updatedAt?: string    // satt server-side
  }

• Ved mount:
   1) Hydrer fra localStorage.
   2) Hent fra /api/emergencies og MERGE inn (behold din numeriske id, ta mongoId/oppdaterte felt).
   3) Synk lokale elementer som mangler mongoId via POST (engang etter merge).

• addEmergency(data)
   – Normaliserer tripId til Number.
   – Lokalt: “én per tripId” (erstatter eksisterende for samme tripId).
   – POST til /api/emergencies (API upserter basert på tripId).
   – Lagrer mongoId i state ved suksess.

• updateEmergency(id, patch)
   – Optimistisk oppdater lokalt (normaliserer tripId om det endres).
   – PUT til /api/emergencies/:mongoId når vi har mongoId.
   – Ellers POST (upsert) til /api/emergencies og lagre mongoId.

• deleteEmergency(id)
   – Optimistisk slett lokalt.
   – Hvis mongoId finnes: DELETE /api/emergencies/:mongoId (ellers kun lokal sletting).

Bruk:
  const { emergencies, addEmergency, updateEmergency, deleteEmergency } = useEmergency();

Merk:
  – API’et er designet slik at det kun finnes én rad per tripId. Det gir enklere UI og rask tilgang
    til “alt du trenger hvis noe skjer” for en valgt reise.
*/
