// components/context/ActivityContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ActivityContext = createContext();

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const lagret = localStorage.getItem("activities");
    if (lagret) setActivities(JSON.parse(lagret));
  }, []);

  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  const addActivity = (activity) => {
    setActivities((prev) => [...prev, activity]);
  };

  const deleteActivity = (id) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const updateActivity = (id, updated) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
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
