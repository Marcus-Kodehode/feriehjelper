import { useTravel } from "@/components/context/TravelContext";

export default function BudgetCard({ budget }) {
  const { trips } = useTravel();
  const trip = trips.find((t) => t.id === Number(budget.tripId));
  const currency = budget.currency || "kr"; // fallback til kr

  return (
    <div className="bg-[#1f1f1f] text-footerText p-4 rounded-lg shadow-lg border border-contrast mb-4">
      <h2 className="text-lg font-semibold text-primary">
        Budsjett for: {trip ? trip.title : "Ukjent reise"}
      </h2>

      <p className="text-sm text-gray-300">
        Total: {budget.amount} {currency}
      </p>

      {budget.daily && (
        <p className="text-sm text-gray-400">
          Daglig budsjett: {budget.daily} {currency}
        </p>
      )}

      {/* Delposter hvis utfylt */}
      {(budget.transport || budget.accommodation || budget.food || budget.activities || budget.misc) && (
        <div className="mt-2 space-y-1 text-sm text-gray-300">
          {budget.transport && (
            <p>Fly / Transport: {budget.transport} {currency}</p>
          )}
          {budget.accommodation && (
            <p>Hotell / Overnatting: {budget.accommodation} {currency}</p>
          )}
          {budget.food && (
            <p>Mat: {budget.food} {currency}</p>
          )}
          {budget.activities && (
            <p>Aktiviteter: {budget.activities} {currency}</p>
          )}
          {budget.misc && (
            <p>Annet: {budget.misc} {currency}</p>
          )}
        </div>
      )}

      {/* Notater */}
      {budget.notes && (
        <p className="mt-2 text-sm italic text-gray-400">{budget.notes}</p>
      )}
    </div>
  );
}
