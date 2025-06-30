// components/activity/ActivityCard.jsx
"use client";
import { useTravel } from "@/components/context/TravelContext";

export default function ActivityCard({ activity }) {
  const { trips } = useTravel();
  const trip = trips.find((t) => t.id === Number(activity.tripId));

  return (
    <div className="bg-[#1f1f1f] text-footerText p-4 rounded-lg border border-contrast shadow-md mb-4">
      <h3 className="text-lg font-semibold text-primary">
        Aktivitet: {activity.title}
      </h3>
      <p className="text-sm text-gray-300">
        For: {trip ? trip.title : "Ukjent reise"}
      </p>
      {activity.date && (
        <p className="text-sm text-gray-400">Dato: {activity.date}</p>
      )}
      {activity.time && (
        <p className="text-sm text-gray-400">Tid: {activity.time}</p>
      )}
      {activity.location && (
        <p className="text-sm text-gray-400">Sted: {activity.location}</p>
      )}
      {activity.notes && (
        <p className="mt-1 text-sm italic text-gray-400">{activity.notes}</p>
      )}
    </div>
  );
}
