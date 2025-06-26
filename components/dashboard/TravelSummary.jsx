"use client";
import { useTravel } from "@/components/context/TravelContext";
import TravelCard from "../travel/TravelCard";

export default function TravelSummary() {
  const { trips } = useTravel();

  if (trips.length === 0) {
    return <p>Du har ingen reiser enda. Legg til en for å komme i gang!</p>;
  }

  return (
    <div className="grid gap-4 mt-4">
      {trips.map((trip) => (
        <TravelCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
