"use client";
import { useEffect, useState } from "react";
import { useTravel } from "../context/TravelContext";
import { useEmergency } from "../context/EmergencyContext";
import { useLanguage } from "../context/LanguageContext";
import translations from "../lang/translations";

export default function EmergencyForm({ editData, clearEdit }) {
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

  useEffect(() => {
    if (editData) {
      setFormData({
        tripId: String(editData.tripId ?? ""),
        embassy: editData.embassy ?? "",
        police: editData.police ?? "",
        ambulance: editData.ambulance ?? "",
        fire: editData.fire ?? "",
        insurance: editData.insurance ?? "",
        policyNumber: editData.policyNumber ?? "",
        contactPerson: editData.contactPerson ?? "",
        notes: editData.notes ?? "",
      });
    } else {
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
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Keep id if editing so the existing row is replaced
    const payload = {
      id: editData?.id ?? Date.now(),
      ...formData,
    };

    addEmergency(payload);

    // reset + exit edit mode
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
    clearEdit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 border rounded border-contrast bg-zinc-900">
      <h2 className="text-lg font-semibold text-yellow-400">
        {editData ? t.updateActivity : t.addEmergencyInfo}
      </h2>

      <select
        name="tripId"
        value={formData.tripId}
        onChange={handleChange}
        required
        disabled={!!editData} /* unngå trip-bytte i edit med dagens addEmergency */
        className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast disabled:opacity-60"
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

      <div className="flex gap-3">
        <button type="submit" className="px-4 py-2 font-medium text-white rounded bg-accent hover:bg-pink-500">
          {editData ? t.edit : t.saveEmergency}
        </button>
        {editData && (
          <button
            type="button"
            onClick={clearEdit}
            className="px-4 py-2 font-medium text-white bg-gray-600 rounded hover:bg-gray-700"
          >
            {t.cancel}
          </button>
        )}
      </div>
    </form>
  );
}

// EmergencyForm lar brukeren registrere nødinformasjon for en spesifikk reise.
// Skjemaet inkluderer felt som ambassade, politi, brannvesen, forsikring, kontaktperson og notater.
// Data lagres via addEmergency fra EmergencyContext og knyttes til valgt reise fra TravelContext.
// Etter innsending nullstilles skjemaet. Alle feltnavn og plassholdere oversettes via LanguageContext.
// Designet er brukervennlig og stilrent med Tailwind CSS.
