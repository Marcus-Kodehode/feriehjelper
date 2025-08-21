"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const ActivityContext = createContext();

function saveLS(list) {
  try { localStorage.setItem("activities", JSON.stringify(list)); } catch {}
}
function loadLS() {
  try {
    const s = localStorage.getItem("activities");
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const hasHydrated = useRef(false);

  // 1) Hydrer fra localStorage
  useEffect(() => {
    setActivities(loadLS());
    hasHydrated.current = true;
  }, []);

  // 2) Persistér til localStorage
  useEffect(() => {
    if (hasHydrated.current) saveLS(activities);
  }, [activities]);

  // 3) Hent fra API og MERGE inn (behold lokale hvis server er nede)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/activities", { cache: "no-store" });
        if (!res.ok) throw new Error("Fetch activities failed");
        const server = await res.json(); // [{..., id, mongoId}]
        setActivities((prev) => {
          const byId = new Map(prev.map((a) => [a.id, a]));
          server.forEach((s) => {
            const cur = byId.get(s.id);
            if (cur) byId.set(s.id, { ...cur, ...s });
            else byId.set(s.id, s);
          });
          return Array.from(byId.values()).sort((a, b) => {
            // robust sort: dato + tid (mangler tid => 23:59)
            const t = (x) => (x.time && x.time.trim() ? x.time : "23:59");
            return new Date(`${a.date}T${t(a)}`) - new Date(`${b.date}T${t(b)}`);
          });
        });
      } catch (e) {
        console.warn("Using local activities only (API offline?)", e);
      }
    })();
  }, []);

  // 4) Sync lokale uten mongoId (engangs etter merge)
  useEffect(() => {
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
            prev.map((x) => (x.id === a.id ? { ...x, mongoId: saved.mongoId } : x))
          );
        } catch (e) {
          console.warn("Sync activity failed", a.id, e);
        }
      }
    })();
  }, [activities]);

  // --------- API helpers (optimistisk) ---------

  const addActivity = async (input) => {
    const activity = {
      id: input.id || Date.now(),
      tripId: Number(input.tripId),
      ...input,
    };
    setActivities((prev) => [...prev, activity]);

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
      });
      if (!res.ok) throw new Error("POST failed");
      const saved = await res.json();
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? { ...a, mongoId: saved.mongoId } : a))
      );
    } catch (e) {
      console.error("addActivity: server failed, kept locally", e);
    }
  };

  const updateActivity = async (id, patch) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );

    const target = activities.find((a) => a.id === id);
    const mongoId = target?.mongoId;

    try {
      if (mongoId) {
        const res = await fetch(`/api/activities/${mongoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...patch }),
        });
        if (!res.ok) throw new Error("PUT failed");
      } else {
        // opprett på server hvis den ikke finnes der ennå
        const res = await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...target, ...patch }),
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

    try {
      if (target?.mongoId) {
        const res = await fetch(`/api/activities/${target.mongoId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("DELETE by mongoId failed");
      } else {
        const res = await fetch(`/api/activities/local/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("DELETE by localId failed");
      }
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

// ActivityContext lagrer og organiserer alle brukerens aktiviteter per reise.
// Aktivitetene synkroniseres med localStorage automatisk.
// Funksjoner inkluderer: addActivity, deleteActivity og updateActivity.
// Tilgangen deles via ActivityProvider og brukes med useActivity().
