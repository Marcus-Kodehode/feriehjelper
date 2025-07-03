"use client";
import { useTravel } from "@/components/context/TravelContext";
import TravelCard from "../travel/TravelCard";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function TravelSummary() {
  const { trips } = useTravel();
  const { language } = useLanguage();
  const t = translations[language];

  if (trips.length === 0) {
    return <p>{t.noTrips}</p>;
  }

  const today = new Date();
  const sortedTrips = trips.slice().sort((a, b) => new Date(a.from) - new Date(b.from));
  const nextTripId = sortedTrips.find(trip => new Date(trip.from) > today)?.id;

  return (
    <div className="grid gap-4 mt-4">
      {sortedTrips.map((trip) => (
        <TravelCard
          key={trip.id}
          trip={trip}
          isNextTrip={trip.id === nextTripId}
        />
      ))}
    </div>
  );
}
