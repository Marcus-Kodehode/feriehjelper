"use client";
import { useState } from "react";
import { useTravel } from "../context/TravelContext";
import { useActivity } from "../context/ActivityContext";
import { useLanguage } from "../context/LanguageContext";
import translations from "../lang/translations";

import ActivityCard from "./ActivityCard";

export default function GroupedActivityCard({ onEdit }) {
  const { trips } = useTravel();
  const { activities } = useActivity();
  const { language } = useLanguage();
  const t = translations[language];

  const grouped = trips
    .map((trip) => {
      const tripActivities = activities
        .filter((act) => act.tripId === trip.id.toString())
        .sort((a, b) => {
          const aDate = new Date(`${a.date}T${a.time || "00:00"}`);
          const bDate = new Date(`${b.date}T${b.time || "00:00"}`);
          return aDate - bDate;
        });

      return { trip, activities: tripActivities };
    })
    .filter((group) => group.activities.length > 0)
    .sort((a, b) => {
      const firstA = a.activities[0];
      const firstB = b.activities[0];
      const aDate = new Date(`${firstA.date}T${firstA.time || "00:00"}`);
      const bDate = new Date(`${firstB.date}T${firstB.time || "00:00"}`);
      return aDate - bDate;
    });

  return (
    <div className="space-y-6">
      {grouped.map(({ trip, activities }) => (
        <TripActivityGroup
          key={trip.id}
          trip={trip}
          activities={activities}
          onEdit={onEdit}
          t={t}
        />
      ))}
    </div>
  );
}

function TripActivityGroup({ trip, activities, onEdit, t }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? activities : activities.slice(0, 3);

  return (
    <div className="bg-[#1f1f1f] border border-contrast rounded-lg p-4">
      <h3 className="mb-3 text-lg font-bold text-yellow-300">
        {t.activitiesFor}: {trip.title}
      </h3>

      <div className="space-y-3">
        {visible.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onEdit={onEdit}
          />
        ))}
      </div>

      {activities.length > 3 && (
        <div className="mt-4 text-right">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-red-400 hover:underline"
          >
            {showAll ? t.showLess : t.showAll}
          </button>
        </div>
      )}
    </div>
  );
}
// GroupedActivityCard viser aktiviteter gruppert etter reise, sortert etter dato og tid.
// Den henter reiser og aktiviteter fra TravelContext og ActivityContext, og bruker LanguageContext for oversettelser.
// Hver gruppe (TripActivityGroup) viser maks 3 aktiviteter, med mulighet for å vise alle.
// Aktivitetene vises med ActivityCard, og en redigeringsfunksjon sendes videre via onEdit.
// Dette gir brukeren en ryddig og kronologisk oversikt over aktiviteter per reise.
