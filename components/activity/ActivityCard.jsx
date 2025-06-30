"use client";
import { useTravel } from "@/components/context/TravelContext";
import { useActivity } from "@/components/context/ActivityContext";

export default function ActivityCard({ activity, onEdit }) {
  const { trips } = useTravel();
  const { deleteActivity } = useActivity();

  const trip = trips.find((t) => t.id === Number(activity.tripId));

  return (
    <div className="relative bg-[#1f1f1f] text-footerText p-4 rounded-lg border border-contrast shadow mb-4">
      {/* Rediger og slett-knapper øverst til høyre */}
      <div className="absolute space-x-2 text-sm top-2 right-3">
        <button
          onClick={() => onEdit(activity)}
          className="text-blue-400 hover:underline"
        >
          Rediger
        </button>
        <button
          onClick={() => deleteActivity(activity.id)}
          className="text-red-500 hover:underline"
        >
          Slett
        </button>
      </div>

      <h3 className="text-lg font-semibold text-yellow-300">{activity.name}</h3>
      <p className="text-sm text-gray-400">
        For: {trip ? trip.title : "Ukjent reise"}
      </p>
      {activity.date && activity.time && (
        <p className="text-sm text-gray-400">
          {activity.date} kl. {activity.time}
        </p>
      )}
      {activity.place && (
        <p className="text-sm text-gray-400">Sted: {activity.place}</p>
      )}
      {activity.cost && (
        <p className="text-sm text-gray-400">Kostnad: {activity.cost} kr</p>
      )}
      {activity.category && (
        <p className="text-sm italic text-gray-400">
          Kategori: {activity.category}
        </p>
      )}
      {activity.notes && (
        <p className="text-sm italic text-gray-500">{activity.notes}</p>
      )}
      {activity.link && (
        <a
          href={activity.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-pink-400 underline"
        >
          Mer info
        </a>
      )}
    </div>
  );
}
