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

  if (!budget) return null;

  const trip = trips.find((tt) => tt.id === Number(budget.tripId));
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

  return (
    <div className="relative bg-[#1f1f1f] text-footerText p-4 rounded-lg shadow-lg border border-contrast mb-4">
      <h2 className="mb-2 text-lg font-semibold text-primary">
        {t.budgetFor}: {trip ? trip.title : t.unknownTrip}
      </h2>

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
            <button onClick={handleSave} className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700">
              {t.save}
            </button>
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-700">
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Knappene: nederst-høyre på mobil, øverst-høyre på desktop */}
      <div className="flex justify-end w-full gap-2 mt-3 sm:w-auto sm:justify-start sm:mt-0 sm:absolute sm:top-2 sm:right-3">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-2 py-1 text-xs btn-edit sm:px-3 sm:py-1 sm:text-sm"
          >
            {t.edit}
          </button>
        )}
        <button
          onClick={() => deleteBudget(budget.id)}
          className="px-2 py-1 text-xs btn-delete sm:px-3 sm:py-1 sm:text-sm"
        >
          {t.delete}
        </button>
      </div>
    </div>
  );
}

// BudgetCard viser et budsjett koblet til en spesifikk reise, hentet fra TravelContext.
// Brukeren kan se budsjettinfo, som totalbeløp, daglig forbruk og kategorier (mat, aktiviteter osv).
// Det er støtte for å redigere budsjettet direkte i kortet med inline input-felter,
// eller slette det helt ved hjelp av funksjoner fra BudgetContext.
// Språk tilpasses automatisk med LanguageContext, og budsjettet vises også visuelt via BudgetSummary.
// Alt er pakket inn i en mørk, stilig layout med Tailwind CSS.
