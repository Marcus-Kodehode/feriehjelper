// app/activity/page.jsx
"use client";
import { useEffect, useState } from "react";
import ActivityCard from "@/components/activity/ActivityCard";

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const lagret = localStorage.getItem("activities");
    if (lagret) {
      setActivities(JSON.parse(lagret));
    }
  }, []);

  return (
    <div className="p-6 text-footerText">
      <h1 className="mb-4 text-2xl font-bold text-primary">Mine aktiviteter</h1>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-400">Ingen aktiviteter enda.</p>
      ) : (
        activities.map((a) => <ActivityCard key={a.id} activity={a} />)
      )}
    </div>
  );
}
