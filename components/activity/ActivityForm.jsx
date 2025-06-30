"use client";
import { useState } from "react";
import { useActivity } from "../context/ActivityContext";
import { useTravel } from "../context/TravelContext";

export default function ActivityForm() {
  const { addActivity } = useActivity();
  const { trips } = useTravel();

  const [formData, setFormData] = useState({
    tripId: "",
    name: "",
    date: "",
    time: "",
    place: "",
    cost: "",
    notes: "",
    link: "",
    category: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newActivity = {
      id: Date.now(),
      ...formData,
    };
    addActivity(newActivity);
    setFormData({
      tripId: "",
      name: "",
      date: "",
      time: "",
      place: "",
      cost: "",
      notes: "",
      link: "",
      category: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        name="tripId"
        value={formData.tripId}
        onChange={handleChange}
        required
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      >
        <option value="">Velg reise</option>
        {trips.map((trip) => (
          <option key={trip.id} value={trip.id}>
            {trip.title}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="name"
        placeholder="Navn på aktivitet"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="time"
        name="time"
        value={formData.time}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="place"
        placeholder="Sted"
        value={formData.place}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="number"
        name="cost"
        placeholder="Kostnad (valgfritt)"
        value={formData.cost}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="link"
        placeholder="Lenke (valgfritt)"
        value={formData.link}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      >
        <option value="">Kategori (valgfritt)</option>
        <option value="Severdighet">Severdighet</option>
        <option value="Restaurant">Restaurant</option>
        <option value="Utflukt">Utflukt</option>
        <option value="Transport">Transport</option>
        <option value="Annet">Annet</option>
      </select>

      <textarea
        name="notes"
        placeholder="Notater"
        value={formData.notes}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <button
        type="submit"
        className="px-4 py-2 font-medium text-white rounded bg-accent hover:bg-pink-500"
      >
        Legg til aktivitet
      </button>
    </form>
  );
}
