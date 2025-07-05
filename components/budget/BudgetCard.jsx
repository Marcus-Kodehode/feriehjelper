"use client";
import { useState } from "react";
import { useTravel } from "@/components/context/TravelContext";
import { useBudget } from "@/components/context/BudgetContext";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";
import BudgetSummary from "@/components/budget/BudgetSummary";

export default function BudgetCard({ budget }) {
  const { trips } = useTravel();
  const { updateBudget, deleteBudget } = useBudget();
  const { language } = useLanguage();
  const t = translations[language];

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
          {t.budgetFor}: {trip ? trip.title : t.unknownTrip}
        </h2>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm underline text-accent"
            >
              {t.edit}
            </button>
          )}
          <button
            onClick={() => deleteBudget(budget.id)}
            className="text-sm text-red-500 underline"
          >
            {t.delete}
          </button>
        </div>
      </div>

      {!isEditing ? (
        <>
          <p className="text-sm text-gray-300">
            {t.total}: {budget.amount} {budget.currency || "kr"}
          </p>
          {budget.daily && (
            <p className="text-sm text-gray-400">
              {t.daily}: {budget.daily} {budget.currency || "kr"}
            </p>
          )}
          {budget.food && (
            <p className="text-sm text-gray-400">
              {t.food}: {budget.food} {budget.currency || "kr"}
            </p>
          )}
          {budget.accommodation && (
            <p className="text-sm text-gray-400">
              {t.accommodation}: {budget.accommodation} {budget.currency || "kr"}
            </p>
          )}
          {budget.activities && (
            <p className="text-sm text-gray-400">
              {t.activities}: {budget.activities} {budget.currency || "kr"}
            </p>
          )}
          {budget.other && (
            <p className="text-sm text-gray-400">
              {t.other}: {budget.other} {budget.currency || "kr"}
            </p>
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
            placeholder={t.totalBudget}
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <input
            type="number"
            name="daily"
            placeholder={t.dailyBudget}
            value={formData.daily || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <input
            type="number"
            name="food"
            placeholder={t.food}
            value={formData.food || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <input
            type="number"
            name="accommodation"
            placeholder={t.accommodation}
            value={formData.accommodation || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <input
            type="number"
            name="activities"
            placeholder={t.activities}
            value={formData.activities || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <input
            type="number"
            name="other"
            placeholder={t.other}
            value={formData.other || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <textarea
            name="notes"
            placeholder={t.notes}
            value={formData.notes || ""}
            onChange={handleChange}
            className="w-full p-1 text-sm border rounded bg-zinc-800 border-contrast"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
            >
              {t.save}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// BudgetCard viser et budsjett koblet til en spesifikk reise, hentet fra TravelContext.
// Brukeren kan se budsjettinfo, som totalbeløp, daglig forbruk og kategorier (mat, aktiviteter osv).
// Det er støtte for å redigere budsjettet direkte i kortet med inline input-felter,
// eller slette det helt ved hjelp av funksjoner fra BudgetContext.
// Språk tilpasses automatisk med LanguageContext, og budsjettet vises også visuelt via BudgetSummary.
// Alt er pakket inn i en mørk, stilig layout med Tailwind CSS.
