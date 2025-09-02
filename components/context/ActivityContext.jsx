"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const ActivityContext = createContext();

// LS helpers med dynamisk nøkkel
function saveLS(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
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

export function ActivityProvider({ children }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const storageKey =
    isLoaded && isSignedIn ? `activities:${userId}` : "activities:guest";

  const [activities, setActivities] = useState([]);
  const hasHydrated = useRef(false);

  // 1) Hydrer fra localStorage når nøkkelen endres (inn/ut av bruker)
  useEffect(() => {
    if (!isLoaded) return;
    setActivities(loadLS(storageKey));
    hasHydrated.current = true;
  }, [isLoaded, storageKey]);

  // 2) Persistér til localStorage
  useEffect(() => {
    if (hasHydrated.current) saveLS(storageKey, activities);
  }, [storageKey, activities]);

  // 3) Hent fra API (kun innlogget) og MERGE inn
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/activities", {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Fetch activities failed");
        const server = await res.json(); // [{..., id, mongoId}]
        setActivities((prev) => {
          const byId = new Map(prev.map((a) => [a.id, a]));
          server.forEach((s) => {
            const cur = byId.get(s.id);
            if (cur) byId.set(s.id, { ...cur, ...s });
            else byId.set(s.id, s);
          });
          const list = Array.from(byId.values());
          // robust sort: dato + tid (mangler tid => 23:59)
          const t = (x) => (x.time && x.time.trim() ? x.time : "23:59");
          return list.sort(
            (a, b) =>
              new Date(`${a.date}T${t(a)}`) - new Date(`${b.date}T${t(b)}`)
          );
        });
      } catch (e) {
        if (e.name !== "AbortError")
          console.warn("Using local activities only (API offline?)", e);
      }
    })();

    return () => ac.abort();
  }, [isLoaded, isSignedIn, storageKey]);

  // 4) Sync lokale uten mongoId (kun innlogget)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      const toSync = activities.filter((a) => a && a.id && !a.mongoId);
      if (!toSync.length) return;
      for (const a of toSync) {
        try {
          const res = await fetch("/api/activities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(a),
          });
          if (!res.ok) throw new Error("sync POST failed");
          const saved = await res.json(); // { ...a, mongoId }
          setActivities((prev) =>
            prev.map((x) =>
              x.id === a.id ? { ...x, mongoId: saved.mongoId } : x
            )
          );
        } catch (e) {
          console.warn("Sync activity failed", a.id, e);
        }
      }
    })();
  }, [isLoaded, isSignedIn, activities]);

  // --------- API helpers (optimistisk) ---------

  const addActivity = async (input) => {
    const activity = {
      id: input.id || Date.now(),
      tripId: Number(input.tripId),
      ...input,
    };
    setActivities((prev) => [...prev, activity]);

    if (!isLoaded || !isSignedIn) return; // gjest: ikke kall server

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
      });
      if (!res.ok) throw new Error("POST failed");
      const saved = await res.json();
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activity.id ? { ...a, mongoId: saved.mongoId } : a
        )
      );
    } catch (e) {
      console.error("addActivity: server failed, kept locally", e);
    }
  };

  const updateActivity = async (id, patch) => {
    const norm = {
      ...patch,
      ...(patch.tripId != null ? { tripId: Number(patch.tripId) } : {}),
    };
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...norm } : a))
    );

    if (!isLoaded || !isSignedIn) return;

    const target = activities.find((a) => a.id === id);
    const mongoId = target?.mongoId;

    try {
      if (mongoId) {
        const res = await fetch(`/api/activities/${mongoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...norm }),
        });
        if (!res.ok) throw new Error("PUT failed");
      } else {
        const res = await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...norm }),
        });
        if (!res.ok) throw new Error("POST (no mongoId) failed");
        const saved = await res.json();
        setActivities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, mongoId: saved.mongoId } : a))
        );
      }
    } catch (e) {
      console.error("updateActivity: server failed, kept local state", e);
    }
  };

  const deleteActivity = async (id) => {
    const target = activities.find((a) => a.id === id);
    // optimistisk lokalt
    setActivities((prev) => prev.filter((a) => a.id !== id));

    if (!isLoaded || !isSignedIn || !target?.mongoId) return;

    try {
      const res = await fetch(`/api/activities/${target.mongoId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("DELETE failed");
    } catch (e) {
      console.error("deleteActivity: server delete failed, removed locally", e);
    }
  };

  return (
    <ActivityContext.Provider
      value={{ activities, addActivity, deleteActivity, updateActivity }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export const useActivity = () => useContext(ActivityContext);

/*
ActivityContext — offline-først og robust synk

• Kilde for alle aktiviteter (per reise). Alltid lagret i localStorage.
• Ved mount:
   1) Hydrer fra localStorage.
   2) Hent fra /api/activities og MERGE inn (beholder lokale felter, tar med mongoId m.m.).
   3) Synk alle lokale elementer som mangler mongoId via POST (engang etter merge).
• addActivity(input):
   – Optimistisk legg til (id = Date.now() hvis mangler, tripId castes til Number).
   – POST til /api/activities, lagrer mongoId ved suksess.
• updateActivity(id, patch):
   – Optimistisk oppdater lokalt.
   – PUT til /api/activities/:mongoId hvis vi har mongoId.
   – Ellers POST (upsert) til /api/activities og lagre mongoId i state.
• deleteActivity(id):
   – Optimistisk slett lokalt.
   – DELETE til /api/activities/:mongoId hvis vi har mongoId.
   – Fallback: DELETE til /api/activities/local/:id (slett på numerisk id).
• Sortering:
   – Aktivitetene sorteres på dato+tid (mangler tid => "23:59") for stabil “neste aktivitet”.

Bruk:
  const { activities, addActivity, updateActivity, deleteActivity } = useActivity();

Forventet shape:
  {
    id: number,           // din stabile, numeriske id (beholdes)
    mongoId?: string,     // MongoDB ObjectId (settes av server)
    tripId: number,
    name: string,
    date: 'YYYY-MM-DD',
    time?: 'HH:mm',
    place?: string,
    cost?: number,
    category?: string,    // lagres som kode; oversettes i UI
    notes?: string,
    link?: string
  }
*/
