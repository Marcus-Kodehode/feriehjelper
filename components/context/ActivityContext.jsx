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

const ActivityContext = createContext(null);

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

export function ActivityProvider({ children }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const storageKey = useMemo(
    () => (isLoaded && isSignedIn ? `activities:${userId}` : null),
    [isLoaded, isSignedIn, userId]
  );

  const [activities, setActivities] = useState([]);
  const hydrated = useRef(false);

  // Hydrate per user (empty when logged out)
  useEffect(() => {
    if (!isLoaded) return;
    // clean up any old guest key
    try {
      if (!isSignedIn) localStorage.removeItem("activities:guest");
    } catch {}
    setActivities(storageKey ? readLS(storageKey) : []);
    hydrated.current = true;
  }, [isLoaded, isSignedIn, storageKey]);

  // Persist only when signed in (we have a storageKey)
  useEffect(() => {
    if (hydrated.current && storageKey) writeLS(storageKey, activities);
  }, [storageKey, activities]);

  // Fetch & merge from API (signed in only)
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
          for (const s of server) {
            const cur = byId.get(s.id);
            byId.set(s.id, { ...(cur || {}), ...s });
          }
          const list = Array.from(byId.values());
          const t = (x) => (x.time && x.time.trim() ? x.time : "23:59");
          return list.sort(
            (a, b) =>
              new Date(`${a.date}T${t(a)}`) - new Date(`${b.date}T${t(b)}`)
          );
        });
      } catch (e) {
        if (e.name !== "AbortError")
          console.warn("Using local only (API offline?)", e);
      }
    })();
    return () => ac.abort();
  }, [isLoaded, isSignedIn, storageKey]);

  // Sync local items missing mongoId (signed in only)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      const toSync = activities.filter((a) => a && a.id && !a.mongoId);
      for (const a of toSync) {
        try {
          const r = await fetch("/api/activities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(a),
          });
          if (!r.ok) continue;
          const saved = await r.json();
          setActivities((prev) =>
            prev.map((x) =>
              x.id === a.id ? { ...x, mongoId: saved.mongoId } : x
            )
          );
        } catch {}
      }
    })();
  }, [isLoaded, isSignedIn, activities]);

  const requireAuth = () => {
    if (!isLoaded || !isSignedIn) {
      console.warn("Not signed in: writes are blocked");
      return false;
    }
    return true;
  };

  // ---- Actions (blocked when logged out) ----
  const addActivity = async (input) => {
    if (!requireAuth()) return;
    const activity = {
      id: input.id || Date.now(),
      tripId: Number(input.tripId),
      ...input,
    };
    setActivities((prev) => [...prev, activity]);
    try {
      const r = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
      });
      if (!r.ok) throw new Error("POST failed");
      const saved = await r.json();
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activity.id ? { ...a, mongoId: saved.mongoId } : a
        )
      );
    } catch (e) {
      console.error("addActivity failed", e);
    }
  };

  const updateActivity = async (id, patch) => {
    if (!requireAuth()) return;
    const norm = {
      ...patch,
      ...(patch.tripId != null ? { tripId: Number(patch.tripId) } : {}),
    };
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...norm } : a))
    );
    const target = activities.find((a) => a.id === id);
    const mongoId = target?.mongoId;
    try {
      if (mongoId) {
        const r = await fetch(`/api/activities/${mongoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...norm }),
        });
        if (!r.ok) throw new Error("PUT failed");
      } else {
        const r = await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...norm }),
        });
        if (!r.ok) throw new Error("POST (no mongoId) failed");
        const saved = await r.json();
        setActivities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, mongoId: saved.mongoId } : a))
        );
      }
    } catch (e) {
      console.error("updateActivity failed", e);
    }
  };

  const deleteActivity = async (id) => {
    if (!requireAuth()) return;
    const target = activities.find((a) => a.id === id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
    if (!target?.mongoId) return;
    try {
      const r = await fetch(`/api/activities/${target.mongoId}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error("DELETE failed");
    } catch (e) {
      console.error("deleteActivity failed", e);
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
