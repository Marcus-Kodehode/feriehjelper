"use client";
import { useState } from "react";
import { useTravel } from "@/components/context/TravelContext";

export default function TravelForm() {
  const { addTrip } = useTravel();

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    from: "",
    to: "",
    transport: "",
    stay: "",
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

    const nyReise = {
      id: Date.now(),
      ...formData,
    };

    addTrip(nyReise);
    setFormData({ title: "", destination: "", from: "", to: "", transport: "", stay: "", notes: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          type="text"
          name="title"
          placeholder="Reisetittel (f.eks Roma 2025)"
          value={formData.title}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="destination"
          placeholder="Destinasjon"
          value={formData.destination}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="date"
          name="from"
          value={formData.from}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="date"
          name="to"
          value={formData.to}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="transport"
          placeholder="Reisemetode / selskap (f.eks SAS fly)"
          value={formData.transport}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="stay"
          placeholder="Oppholdssted (f.eks Hotel Roma)"
          value={formData.stay}
          onChange={handleChange}
          className="p-2 border rounded"
        />
      </div>

      <textarea
        name="notes"
        placeholder="Andre notater"
        value={formData.notes}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <button type="submit" className="px-4 py-2 text-white rounded bg-accent hover:bg-pink-500">
        Legg til reise
      </button>
    </form>
  );
}
