'use client';
import { useState } from "react";
import { useTravel } from "@/components/context/TravelContext";
import { useBudget } from "@/components/context/BudgetContext";
import BudgetSummary from "@/components/budget/BudgetSummary";

export default function BudgetCard({ budget }) {
  const { trips } = useTravel();
  const { updateBudget, deleteBudget } = useBudget();
  const trip = trips.find((t) => t.id === Number(budget.tripId));

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...budget });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateBudget(budget.id, formData);
    setIsEditing(false);
  };

  if (!budget) return null;

  return (
    <div className="bg-[#1f1f1f] text-footerText p-4 rounded-lg shadow-lg border border-contrast mb-4">
      <div className="flex items-start justify-between mb-2">
        <h2 className="text-lg font-semibold text-primary">
          Budsjett for: {trip ? trip.title : "Ukjent reise"}
        </h2>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm underline text-accent"
            >
              Rediger
            </button>
          )}
          <button
            onClick={() => deleteBudget(budget.id)}
            className="text-sm text-red-500 underline"
          >
            Slett
          </button>
        </div>
      </div>

      {!isEditing ? (
        <>
          <p className="text-sm text-gray-300">Total: {budget.amount} {budget.currency || "kr"}</p>
          {budget.daily && (
            <p className="text-sm text-gray-400">Daglig: {budget.daily} {budget.currency || "kr"}</p>
          )}
          {budget.food && (
            <p className="text-sm text-gray-400">Mat: {budget.food} {budget.currency || "kr"}</p>
          )}
          {budget.accommodation && (
            <p className="text-sm text-gray-400">Overnatting: {budget.accommodation} {budget.currency || "kr"}</p>
          )}
          {budget.activities && (
            <p className="text-sm text-gray-400">Aktiviteter: {budget.activities} {budget.currency || "kr"}</p>
          )}
          {budget.other && (
            <p className="text-sm text-gray-400">Annet: {budget.other} {budget.currency || "kr"}</p>
          )}
          {budget.notes && (
            <p className="mt-1 text-sm italic text-gray-400">{budget.notes}</p>
          )}
          <BudgetSummary budget={budget} />
        </>
      ) : (
        <div className="mt-2 space-y-2">
          <input
            type="number"
            name="amount"
            placeholder="Totalbudsjett"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <input
            type="number"
            name="daily"
            placeholder="Daglig budsjett"
            value={formData.daily || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <input
            type="number"
            name="food"
            placeholder="Mat"
            value={formData.food || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <input
            type="number"
            name="accommodation"
            placeholder="Overnatting"
            value={formData.accommodation || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <input
            type="number"
            name="activities"
            placeholder="Aktiviteter"
            value={formData.activities || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <input
            type="number"
            name="other"
            placeholder="Annet"
            value={formData.other || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <textarea
            name="notes"
            placeholder="Notater"
            value={formData.notes || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
            >
              Lagre
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
