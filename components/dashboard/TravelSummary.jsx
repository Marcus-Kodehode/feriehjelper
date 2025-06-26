"use client";
import { useTravel } from "@/components/context/TravelContext";
import TravelCard from "../travel/TravelCard";

export default function TravelSummary() {
  const { trips } = useTravel();

  if (trips.length === 0) {
    return <p>Du har ingen reiser enda. Gå til Reiser siden og legg til en for å komme i gang!</p>;
  }

  const today = new Date();

  // Sorter reiser etter startdato
  const sortedTrips = trips.slice().sort((a, b) => new Date(a.from) - new Date(b.from));

  // Finn første fremtidige reise
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
