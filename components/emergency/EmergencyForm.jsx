"use client";
import { useState } from "react";
import { useTravel } from "@/components/context/TravelContext";
import { useEmergency } from "@/components/context/EmergencyContext";

export default function EmergencyForm() {
  const { trips } = useTravel();
  const { addEmergency } = useEmergency();

  const [formData, setFormData] = useState({
    tripId: "",
    embassy: "",
    police: "",
    ambulance: "",
    fire: "",
    insurance: "",
    policyNumber: "",
    contactPerson: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEmergency = {
      id: Date.now(),
      ...formData,
    };
    addEmergency(newEmergency);

    // Nullstill skjema
    setFormData({
      tripId: "",
      embassy: "",
      police: "",
      ambulance: "",
      fire: "",
      insurance: "",
      policyNumber: "",
      contactPerson: "",
      notes: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-4 border rounded border-contrast bg-zinc-900"
    >
      <h2 className="text-lg font-semibold text-yellow-400">
        Legg til nødinformasjon
      </h2>

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

      <input
        type="text"
        name="embassy"
        placeholder="Adresse til ambassade / konsulat"
        value={formData.embassy}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="police"
        placeholder="Nødnummer politi"
        value={formData.police}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="ambulance"
        placeholder="Nødnummer ambulanse"
        value={formData.ambulance}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="fire"
        placeholder="Nødnummer brann"
        value={formData.fire}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="insurance"
        placeholder="Forsikringsselskap"
        value={formData.insurance}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="policyNumber"
        placeholder="Polisenummer"
        value={formData.policyNumber}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="contactPerson"
        placeholder="Kontaktperson (navn og nummer)"
        value={formData.contactPerson}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <textarea
        name="notes"
        placeholder="Tilleggsinfo / notater"
        value={formData.notes}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <button
        type="submit"
        className="px-4 py-2 font-medium text-white rounded bg-accent hover:bg-pink-500"
      >
        Lagre nødinformasjon
      </button>
    </form>
  );
}
