"use client";
import { useState } from "react";
import { useBudget } from "@/components/context/BudgetContext";
import { useTravel } from "@/components/context/TravelContext";

export default function BudgetForm() {
  const { addBudget } = useBudget();
  const { trips } = useTravel();

  const [formData, setFormData] = useState({
    tripId: "",
    amount: "",
    daily: "",
    notes: "",
    currency: "NOK", // Standard valuta
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

    const selectedTrip = trips.find((t) => t.id === Number(formData.tripId));
    let dailyBudget = formData.daily;

    // Automatisk beregning av daglig budsjett hvis det ikke er fylt inn
    if (!dailyBudget && selectedTrip) {
      const days =
        Math.ceil(
          (new Date(selectedTrip.to) - new Date(selectedTrip.from)) /
            (1000 * 60 * 60 * 24)
        ) + 1;
      dailyBudget = (Number(formData.amount) / days).toFixed(0);
    }

    const newBudget = {
      id: Date.now(),
      ...formData,
      daily: dailyBudget,
    };

    addBudget(newBudget);
    setFormData({
      tripId: "",
      amount: "",
      daily: "",
      notes: "",
      currency: "NOK",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Velg reise */}
      <select
        name="tripId"
        value={formData.tripId}
        onChange={handleChange}
        required
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      >
        <option value="">Velg tilhørende reise</option>
        {trips.map((trip) => (
          <option key={trip.id} value={trip.id}>
            {trip.title}
          </option>
        ))}
      </select>

      {/* Velg valuta */}
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
        <option value="SEK">SEK (kr)</option>
      </select>

      {/* Totalbudsjett */}
      <input
        type="number"
        name="amount"
        placeholder="Totalbudsjett"
        value={formData.amount}
        onChange={handleChange}
        required
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      {/* Daglig budsjett (valgfritt) */}
      <input
        type="number"
        name="daily"
        placeholder="Daglig budsjett (valgfritt)"
        value={formData.daily}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      {/* Notater */}
      <textarea
        name="notes"
        placeholder="Notater (valgfritt)"
        value={formData.notes}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      {/* Lagre knapp */}
      <button
        type="submit"
        className="px-4 py-2 font-medium text-white rounded bg-accent hover:bg-pink-500"
      >
        Lagre budsjett
      </button>
    </form>
  );
}
