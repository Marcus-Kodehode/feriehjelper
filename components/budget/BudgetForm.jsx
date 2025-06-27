"use client";
import { useState } from "react";
import { useBudget } from "@/components/context/BudgetContext";
import { useTravel } from "@/components/context/TravelContext";

export default function BudgetForm() {
  const { addBudget } = useBudget();
  const { trips } = useTravel();

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

    const newBudget = {
      id: Date.now(),
      ...formData,
    };

    addBudget(newBudget);

    // Tilbakestill
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
        <option value="">Velg tilhørende reise</option>
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
        placeholder="Totalbudsjett"
        value={formData.amount}
        onChange={handleChange}
        required
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      {/* Valgfrie felt */}
      <input
        type="number"
        name="daily"
        placeholder="Daglig budsjett (valgfritt)"
        value={formData.daily}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="number"
        name="transport"
        placeholder="Fly / Transport (valgfritt)"
        value={formData.transport}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="number"
        name="accommodation"
        placeholder="Hotell / Overnatting (valgfritt)"
        value={formData.accommodation}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="number"
        name="food"
        placeholder="Mat (valgfritt)"
        value={formData.food}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="number"
        name="activities"
        placeholder="Aktiviteter (valgfritt)"
        value={formData.activities}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="number"
        name="misc"
        placeholder="Annet (valgfritt)"
        value={formData.misc}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <textarea
        name="notes"
        placeholder="Notater (valgfritt)"
        value={formData.notes}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <button
        type="submit"
        className="px-4 py-2 font-medium text-white rounded bg-accent hover:bg-pink-500"
      >
        Lagre budsjett
      </button>
    </form>
  );
}
