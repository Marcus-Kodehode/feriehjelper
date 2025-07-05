"use client";
import { useState } from "react";
import { useBudget } from "@/components/context/BudgetContext";
import { useTravel } from "@/components/context/TravelContext";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function BudgetForm() {
  const { addBudget } = useBudget();
  const { trips } = useTravel();
  const { language } = useLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState({
    tripId: "",
    currency: "NOK",
    amount: "",
    daily: "",
    transport: "",
    accommodation: "",
    food: "",
    activities: "",
    misc: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addBudget({ id: Date.now(), ...formData });

    // Nullstill skjema
    setFormData({
      tripId: "",
      currency: "NOK",
      amount: "",
      daily: "",
      transport: "",
      accommodation: "",
      food: "",
      activities: "",
      misc: "",
      notes: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Reisekobling */}
      <select
        name="tripId"
        value={formData.tripId}
        onChange={handleChange}
        required
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      >
        <option value="">{t.selectTrip}</option>
        {trips.map((trip) => (
          <option key={trip.id} value={trip.id}>
            {trip.title}
          </option>
        ))}
      </select>

      {/* Valuta */}
      <select
        name="currency"
        value={formData.currency}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      >
        <option value="NOK">NOK (kr)</option>
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
        <option value="GBP">GBP (£)</option>
      </select>

      {/* Påkrevd totalbudsjett */}
      <input
        type="number"
        name="amount"
        placeholder={t.totalBudget}
        value={formData.amount}
        onChange={handleChange}
        required
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      {/* Valgfrie felt */}
      <input
        type="number"
        name="daily"
        placeholder={t.dailyBudgetOpt}
        value={formData.daily}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="number"
        name="transport"
        placeholder={t.transportOpt}
        value={formData.transport}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="number"
        name="accommodation"
        placeholder={t.accommodationOpt}
        value={formData.accommodation}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="number"
        name="food"
        placeholder={t.foodOpt}
        value={formData.food}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="number"
        name="activities"
        placeholder={t.activitiesOpt}
        value={formData.activities}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="number"
        name="misc"
        placeholder={t.otherOpt}
        value={formData.misc}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <textarea
        name="notes"
        placeholder={t.notesOpt}
        value={formData.notes}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <button
        type="submit"
        className="px-4 py-2 font-medium text-white rounded bg-accent hover:bg-pink-500"
      >
        {t.saveBudget}
      </button>
    </form>
  );
}
// BudgetForm lar brukeren opprette et nytt budsjett knyttet til en eksisterende reise.
// Data sendes til BudgetContext via addBudget, og skjemaet nullstilles etter innsending.
// Skjemaet inneholder både påkrevde og valgfrie felter: reise, valuta, totalbudsjett, samt kategorier som mat og aktiviteter.
// Tilgjengelige reiser hentes fra TravelContext for å koble budsjettet riktig.
// Tekster og plassholdere oversettes via LanguageContext, og layouten bruker Tailwind CSS.
// Enkelt og brukervennlig skjema for å gjøre budsjettering lett og oversiktlig.
