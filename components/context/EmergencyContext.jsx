"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const EmergencyContext = createContext();

// LS helpers med dynamisk nøkkel
function saveLS(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
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

export function EmergencyProvider({ children }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const storageKey =
    isLoaded && isSignedIn ? `emergencyData:${userId}` : "emergencyData:guest";

  const [emergencies, setEmergencies] = useState([]);
  const hasHydrated = useRef(false);

  // 1) Hydrer fra localStorage når nøkkelen endres (inn/ut av bruker)
  useEffect(() => {
    if (!isLoaded) return;
    setEmergencies(loadLS(storageKey));
    hasHydrated.current = true;
  }, [isLoaded, storageKey]);

  // 2) Persistér til localStorage
  useEffect(() => {
    if (hasHydrated.current) saveLS(storageKey, emergencies);
  }, [storageKey, emergencies]);

  // 3) Hent fra API (KUN innlogget) og MERGE inn
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
        if (e.name !== "AbortError")
          console.warn("Using local emergencies only (API offline?)", e);
      }
    })();

    return () => ac.abort();
  }, [isLoaded, isSignedIn, storageKey]);

  // 4) Sync lokale uten mongoId (KUN innlogget)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
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
            prev.map((x) =>
              x.id === e.id ? { ...x, mongoId: saved.mongoId } : x
            )
          );
        } catch (err) {
          console.warn("Sync of emergency failed", e.id, err);
        }
      }
    })();
  }, [isLoaded, isSignedIn, emergencies]);

  // ===== API helpers (optimistic) =====

  // add/replace by tripId (én per trip)
  const addEmergency = async (newData) => {
    const parsed = {
      id: newData.id || Date.now(),
      tripId: Number(newData.tripId),
      ...newData,
    };

    // lokalt: sikre én per tripId
    setEmergencies((prev) => {
      const others = prev.filter((e) => Number(e.tripId) !== parsed.tripId);
      return [...others, parsed];
    });

    if (!isLoaded || !isSignedIn) return; // gjest: ikke kall server

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
      console.error("addEmergency: server failed, kept locally", e);
    }
  };

  const updateEmergency = async (id, patch) => {
    const norm = { ...patch };
    if (norm.tripId != null) norm.tripId = Number(norm.tripId);

    setEmergencies((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...norm } : e))
    );

    if (!isLoaded || !isSignedIn) return;

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
    setEmergencies((prev) => prev.filter((e) => e.id !== id)); // optimistisk

    if (!isLoaded || !isSignedIn || !target?.mongoId) return;

    try {
      const res = await fetch(`/api/emergencies/${target.mongoId}`, {
        method: "DELETE",
      });
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
