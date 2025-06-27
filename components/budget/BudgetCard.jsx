import { useTravel } from "@/components/context/TravelContext";

export default function BudgetCard({ budget }) {
  const { trips } = useTravel();
  const trip = trips.find((t) => t.id === Number(budget.tripId));

  return (
    <div className="bg-[#1f1f1f] text-footerText p-4 rounded-lg shadow-lg border border-contrast mb-4">
      <h2 className="text-lg font-semibold text-primary">
        Budsjett for: {trip ? trip.title : "Ukjent reise"}
      </h2>
      <p className="text-sm text-gray-300">Total: {budget.amount} kr</p>
      {budget.daily && (
        <p className="text-sm text-gray-400">Daglig: {budget.daily} kr</p>
      )}
      {budget.notes && (
        <p className="mt-1 text-sm italic text-gray-400">{budget.notes}</p>
      )}
    </div>
  );
}
