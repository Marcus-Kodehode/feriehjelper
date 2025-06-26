"use client";
import { useState } from "react";
import { useTravel } from "@/components/context/TravelContext";
import TravelDetails from "@/components/travel/details/TravelDetails";

export default function TravelCard({ trip, isNextTrip }) {
  const { deleteTrip } = useTravel();
  const [visDetaljer, setVisDetaljer] = useState(false);

  const daysLeft = Math.ceil((new Date(trip.from) - new Date()) / (1000 * 60 * 60 * 24));
  const length = Math.ceil((new Date(trip.to) - new Date(trip.from)) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <>
      <div className="relative bg-[#1f1f1f] text-footerText p-4 rounded-lg shadow-lg mb-4 border border-contrast flex justify-between items-start">
        {/* Venstre side */}
        <div>
          <h2 className="text-lg font-semibold text-primary">{trip.title}</h2>
          <p className="text-sm text-gray-300">{trip.destination}</p>
          <p className="text-sm text-gray-400">{trip.from} – {trip.to}</p>
          <p className="text-sm italic text-gray-400">Varighet: {length} dager</p>
          
          {trip.notes && (
            <p className="mt-1 text-sm italic text-gray-400">{trip.notes}</p>
          )}

          {trip.travelers && (
            <p className="mt-1 text-sm italic text-gray-400">
              {trip.travelers} {trip.travelers === "1" ? "reisende" : "reisende"}
            </p>
          )}

          <button
            onClick={() => setVisDetaljer(true)}
            className="mt-2 text-xs underline text-accent"
          >
            Se detaljer
          </button>
        </div>

        {/* Høyre side */}
        <div className="flex flex-col items-end gap-2">
          {isNextTrip && (
            <span className="px-2 py-1 text-xs font-bold text-green-400 border border-green-500 rounded">
              Neste reise
            </span>
          )}
          <span className="text-sm font-semibold text-pink-400">{daysLeft} dager igjen</span>

          <button
            onClick={() => deleteTrip(trip.id)}
            className="px-2 py-1 mt-2 text-xs text-white bg-red-600 rounded hover:bg-red-700"
          >
            Slett
          </button>
        </div>
      </div>

      {/* Modal */}
      {visDetaljer && (
        <TravelDetails trip={trip} onClose={() => setVisDetaljer(false)} />
      )}
    </>
  );
}
