"use client";
import { useEffect } from "react";
import { useBudget } from "@/components/context/BudgetContext";

export default function TravelDetails({ trip, onClose }) {
  const { budgets } = useBudget();

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!trip) return null;

  const length = Math.ceil((new Date(trip.to) - new Date(trip.from)) / (1000 * 60 * 60 * 24)) + 1;
  const daysLeft = Math.ceil((new Date(trip.from) - new Date()) / (1000 * 60 * 60 * 24));

  const budsjett = budgets.find((b) => Number(b.tripId) === trip.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative w-full max-w-xl p-6 mx-4 border rounded-lg shadow-lg bg-dark border-contrast text-footerText">
        <button
          onClick={onClose}
          className="absolute px-3 py-1 text-sm text-white bg-red-600 rounded top-4 right-4 hover:bg-red-700"
        >
          Lukk
        </button>

        {/* Reiseinfo */}
        <h2 className="mb-2 text-2xl font-bold text-primary">{trip.title}</h2>
        <p className="text-sm text-gray-300">{trip.destination}</p>
        <p className="text-sm text-gray-400">{trip.from} – {trip.to}</p>
        <p className="mb-2 text-sm italic text-gray-400">
          Varighet: {length} dager ({daysLeft} dager igjen)
        </p>

        {trip.transport && (
          <p className="text-sm text-gray-300">
            <span className="font-semibold">Transport:</span> {trip.transport}
          </p>
        )}

        {trip.stay && (
          <p className="text-sm text-gray-300">
            <span className="font-semibold">Opphold:</span> {trip.stay}
          </p>
        )}

        {trip.travelers && (
          <p className="text-sm text-gray-300">
            <span className="font-semibold">Reisende:</span> {trip.travelers}
          </p>
        )}

        {trip.notes && (
          <div className="mt-2">
            <p className="text-sm font-semibold text-gray-300">Notater:</p>
            <p className="text-sm italic text-gray-400">{trip.notes}</p>
          </div>
        )}

        {/* Budsjettseksjon */}
        {budsjett && (
          <div className="mt-4 p-3 bg-[#2a2a2a] border border-yellow-500 rounded-md">
            <p className="mb-1 text-sm font-bold text-yellow-300">Budsjett</p>
            <p className="text-sm text-gray-300">Total: {budsjett.amount} kr</p>
            {budsjett.daily && (
              <p className="text-sm text-gray-300">Daglig: {budsjett.daily} kr</p>
            )}
            {budsjett.notes && (
              <p className="text-sm italic text-gray-400">{budsjett.notes}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
