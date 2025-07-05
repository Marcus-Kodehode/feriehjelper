"use client";
import { useState } from "react";
import { useTravel } from "@/components/context/TravelContext";
import { useEmergency } from "@/components/context/EmergencyContext";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function EmergencyForm() {
  const { trips } = useTravel();
  const { addEmergency } = useEmergency();
  const { language } = useLanguage();
  const t = translations[language];

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
        {t.addEmergencyInfo}
      </h2>

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

      <input
        type="text"
        name="embassy"
        placeholder={t.embassyPlaceholder}
        value={formData.embassy}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="police"
        placeholder={t.policePlaceholder}
        value={formData.police}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="ambulance"
        placeholder={t.ambulancePlaceholder}
        value={formData.ambulance}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="fire"
        placeholder={t.firePlaceholder}
        value={formData.fire}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="insurance"
        placeholder={t.insurancePlaceholder}
        value={formData.insurance}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="policyNumber"
        placeholder={t.policyNumberPlaceholder}
        value={formData.policyNumber}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <input
        type="text"
        name="contactPerson"
        placeholder={t.contactPersonPlaceholder}
        value={formData.contactPerson}
        onChange={handleChange}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <textarea
        name="notes"
        placeholder={t.notesPlaceholder}
        value={formData.notes}
        onChange={handleChange}
        rows={3}
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
      />

      <button
        type="submit"
        className="px-4 py-2 font-medium text-white rounded bg-accent hover:bg-pink-500"
      >
        {t.saveEmergency}
      </button>
    </form>
  );
}
// EmergencyForm lar brukeren registrere nødinformasjon for en spesifikk reise.
// Skjemaet inkluderer felt som ambassade, politi, brannvesen, forsikring, kontaktperson og notater.
// Data lagres via addEmergency fra EmergencyContext og knyttes til valgt reise fra TravelContext.
// Etter innsending nullstilles skjemaet. Alle feltnavn og plassholdere oversettes via LanguageContext.
// Designet er brukervennlig og stilrent med Tailwind CSS.
