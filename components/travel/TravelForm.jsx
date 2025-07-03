"use client";
import { useState } from "react";
import { useTravel } from "@/components/context/TravelContext";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function TravelForm() {
  const { addTrip } = useTravel();
  const { language } = useLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    from: "",
    to: "",
    transport: "",
    stay: "",
    notes: "",
    travelers: "",
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
    setFormData({
      title: "",
      destination: "",
      from: "",
      to: "",
      transport: "",
      stay: "",
      notes: "",
      travelers: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 space-y-4 border rounded-lg bg-dark border-contrast"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Tittel */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm text-gray-400">{t.tripTitleLabel}</label>
          <input
            type="text"
            name="title"
            placeholder={t.tripTitlePlaceholder}
            value={formData.title}
            onChange={handleChange}
            required
            className="p-2 placeholder-gray-400 border rounded bg-zinc-900 border-contrast text-footerText"
          />
        </div>

        {/* Destinasjon */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm text-gray-400">{t.destinationLabel}</label>
          <input
            type="text"
            name="destination"
            placeholder={t.destinationPlaceholder}
            value={formData.destination}
            onChange={handleChange}
            required
            className="p-2 placeholder-gray-400 border rounded bg-zinc-900 border-contrast text-footerText"
          />
        </div>

        {/* Startdato */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm text-gray-400">{t.startDate}</label>
          <input
            type="date"
            name="from"
            value={formData.from}
            onChange={handleChange}
            required
            className="p-2 rounded bg-zinc-900 border border-contrast text-footerText [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        {/* Sluttdato */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm text-gray-400">{t.endDate}</label>
          <input
            type="date"
            name="to"
            value={formData.to}
            onChange={handleChange}
            required
            className="p-2 rounded bg-zinc-900 border border-contrast text-footerText [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        {/* Transport */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm text-gray-400">{t.transportLabel}</label>
          <input
            type="text"
            name="transport"
            placeholder={t.transportPlaceholder}
            value={formData.transport}
            onChange={handleChange}
            className="p-2 placeholder-gray-400 border rounded bg-zinc-900 border-contrast text-footerText"
          />
        </div>

        {/* Overnatting */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm text-gray-400">{t.stayLabel}</label>
          <input
            type="text"
            name="stay"
            placeholder={t.stayPlaceholder}
            value={formData.stay}
            onChange={handleChange}
            className="p-2 placeholder-gray-400 border rounded bg-zinc-900 border-contrast text-footerText"
          />
        </div>

        {/* Antall reisende */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm text-gray-400">{t.travelersLabel}</label>
          <input
            type="number"
            name="travelers"
            placeholder={t.travelersPlaceholder}
            min="1"
            value={formData.travelers}
            onChange={handleChange}
            className="p-2 placeholder-gray-400 border rounded bg-zinc-900 border-contrast text-footerText"
          />
        </div>
      </div>

      {/* Notater */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm text-gray-400">{t.notesLabel}</label>
        <textarea
          name="notes"
          placeholder={t.notesPlaceholder}
          value={formData.notes}
          onChange={handleChange}
          className="w-full p-2 placeholder-gray-400 border rounded bg-zinc-900 border-contrast text-footerText"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 font-medium text-white rounded bg-accent hover:bg-pink-500"
      >
        {t.submitTrip}
      </button>
    </form>
  );
}
