"use client";
import { useState } from "react";
import { useTravel } from "@/components/context/TravelContext";
import { useBudget } from "@/components/context/BudgetContext";
import { useActivity } from "@/components/context/ActivityContext";
import TravelDetails from "@/components/travel/details/TravelDetails";
import BudgetMiniChart from "@/components/budget/BudgetMiniChart";

export default function TravelCard({ trip, isNextTrip }) {
  const { deleteTrip } = useTravel();
  const { budgets } = useBudget();
  const { activities } = useActivity();
  const [visDetaljer, setVisDetaljer] = useState(false);

  const daysLeft = Math.ceil(
    (new Date(trip.from) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const length =
    Math.ceil(
      (new Date(trip.to) - new Date(trip.from)) / (1000 * 60 * 60 * 24)
    ) + 1;

  const budsjett = budgets.find((b) => Number(b.tripId) === trip.id);
  const currency = budsjett?.currency || "kr";

  // Finn neste kommende aktivitet for denne reisen
  const upcomingActivities = activities
    .filter(
      (a) =>
        Number(a.tripId) === trip.id &&
        new Date(a.date + "T" + (a.time || "00:00")) >= new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.date + "T" + (a.time || "00:00")) -
        new Date(b.date + "T" + (b.time || "00:00"))
    );

  const nextActivity = upcomingActivities[0];

  return (
    <>
      <div className="relative bg-[#1f1f1f] text-footerText p-4 rounded-lg shadow-lg mb-4 border border-contrast flex flex-col sm:flex-row justify-between gap-4">
        {/* Venstre innhold */}
        <div className="flex flex-col flex-1 gap-2">
          <div>
            <h2 className="text-lg font-semibold text-primary">{trip.title}</h2>
            <p className="text-sm text-gray-300">{trip.destination}</p>
            <p className="text-sm text-gray-400">
              {trip.from} – {trip.to}
            </p>
            <p className="text-sm italic text-gray-400">
              Varighet: {length} dager
            </p>

            {trip.notes && (
              <p className="mt-1 text-sm italic text-gray-400">{trip.notes}</p>
            )}

            {trip.travelers && (
              <p className="text-sm italic text-gray-400">
                {trip.travelers} reisende
              </p>
            )}
          </div>

          {/* Budsjettinfo med minidiagram */}
          {budsjett && (
            <div className="mt-3 p-3 bg-[#2a2a2a] border border-yellow-500 rounded-md space-y-1">
              <p className="text-sm font-bold text-yellow-300">Budsjett</p>
              <p className="text-sm text-gray-300">
                Total: {budsjett.amount} {currency}
              </p>
              {budsjett.daily && (
                <p className="text-sm text-gray-300">
                  Daglig: {budsjett.daily} {currency}
                </p>
              )}
              {budsjett.transport && (
                <p className="text-sm text-gray-300">
                  Transport: {budsjett.transport} {currency}
                </p>
              )}
              {budsjett.accommodation && (
                <p className="text-sm text-gray-300">
                  Hotell: {budsjett.accommodation} {currency}
                </p>
              )}
              {budsjett.food && (
                <p className="text-sm text-gray-300">
                  Mat: {budsjett.food} {currency}
                </p>
              )}
              {budsjett.activities && (
                <p className="text-sm text-gray-300">
                  Aktiviteter: {budsjett.activities} {currency}
                </p>
              )}
              {budsjett.misc && (
                <p className="text-sm text-gray-300">
                  Annet: {budsjett.misc} {currency}
                </p>
              )}
              {budsjett.notes && (
                <p className="text-sm italic text-gray-400">
                  {budsjett.notes}
                </p>
              )}
              <BudgetMiniChart budget={budsjett} />
            </div>
          )}

          {/* Neste aktivitet hvis finnes */}
          {nextActivity && (
            <div className="mt-3 p-3 bg-[#2a2a2a] border border-green-500 rounded-md space-y-1">
              <p className="text-sm font-bold text-green-300">
                Neste aktivitet
              </p>
              <p className="text-sm text-white">{nextActivity.name}</p>
              <p className="text-sm text-gray-400">
                {nextActivity.date}
                {nextActivity.time && ` kl. ${nextActivity.time}`}
              </p>
              {nextActivity.place && (
                <p className="text-sm text-gray-300">
                  Sted: {nextActivity.place}
                </p>
              )}
            </div>
          )}

          <button
            onClick={() => setVisDetaljer(true)}
            className="mt-2 text-xs underline text-accent w-fit"
          >
            Se detaljer
          </button>
        </div>

        {/* Høyre innhold */}
        <div className="flex flex-col items-end justify-between gap-2">
          {isNextTrip && (
            <span className="px-2 py-1 text-xs font-bold text-green-400 border border-green-500 rounded">
              Neste reise
            </span>
          )}
          <span className="text-sm font-semibold text-pink-400">
            {daysLeft} dager igjen
          </span>

          <button
            onClick={() => deleteTrip(trip.id)}
            className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
          >
            Slett
          </button>
        </div>
      </div>

      {/* Modal med detaljer */}
      {visDetaljer && (
        <TravelDetails trip={trip} onClose={() => setVisDetaljer(false)} />
      )}
    </>
  );
}
