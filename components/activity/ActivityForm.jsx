"use client";
import { useState, useEffect } from "react";
import { useActivity } from "../context/ActivityContext";
import { useTravel } from "../context/TravelContext";
import { useLanguage } from "../context/LanguageContext";
import translations from "../lang/translations";

export default function ActivityForm({ editData, clearEdit }) {
  const { addActivity, updateActivity } = useActivity();
  const { trips } = useTravel();
  const { language } = useLanguage();
  const t = translations[language];

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

  useEffect(() => {
    if (editData) setFormData(editData);
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editData) {
      updateActivity(formData);
      clearEdit();
    } else {
      const newActivity = {
        id: Date.now(),
        ...formData,
      };
      addActivity(newActivity);
    }

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
    <form
      onSubmit={handleSubmit}
      className="mt-6 p-4 bg-[#1f1f1f] border border-contrast rounded-lg space-y-3"
    >
      <h3 className="font-bold text-yellow-400 text-md">
        {editData ? t.updateActivity : t.addNewActivity}
      </h3>

      {/* Reisevalg */}
      <div>
        <label className="block mb-1 text-sm text-gray-400">{t.selectTrip}</label>
        <select
          name="tripId"
          value={formData.tripId}
          onChange={handleChange}
          required
          className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
        >
          <option value="">{t.chooseTrip}</option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.title}
            </option>
          ))}
        </select>
      </div>

      {/* Navn */}
      <div>
        <label className="block mb-1 text-sm text-gray-400">{t.activityName}</label>
        <input
          type="text"
          name="name"
          placeholder={t.activityName}
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
        />
      </div>

      {/* Dato og tid */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-col flex-1">
          <label className="mb-1 text-sm text-gray-400">{t.date}</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="p-2 text-white border rounded bg-zinc-900 border-contrast [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
        <div className="flex flex-col flex-1">
          <label className="mb-1 text-sm text-gray-400">{t.time}</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="p-2 text-white border rounded bg-zinc-900 border-contrast [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
      </div>

      {/* Sted */}
      <div>
        <label className="block mb-1 text-sm text-gray-400">{t.place}</label>
        <input
          type="text"
          name="place"
          placeholder={t.place}
          value={formData.place}
          onChange={handleChange}
          className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
        />
      </div>

      {/* Kostnad */}
      <div>
        <label className="block mb-1 text-sm text-gray-400">{t.cost}</label>
        <input
          type="number"
          name="cost"
          placeholder={`${t.cost} (${t.optional})`}
          value={formData.cost}
          onChange={handleChange}
          className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
        />
      </div>

      {/* Lenke */}
      <div>
        <label className="block mb-1 text-sm text-gray-400">{t.link}</label>
        <input
          type="text"
          name="link"
          placeholder={`${t.link} (${t.optional})`}
          value={formData.link}
          onChange={handleChange}
          className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
        />
      </div>

      {/* Kategori */}
      <div>
        <label className="block mb-1 text-sm text-gray-400">{t.category}</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
        >
          <option value="">{t.optional}</option>
          <option value="Severdighet">{t.sight}</option>
          <option value="Restaurant">{t.restaurant}</option>
          <option value="Utflukt">{t.excursion}</option>
          <option value="Transport">{t.transport}</option>
          <option value="Annet">{t.other}</option>
        </select>
      </div>

      {/* Notater */}
      <div>
        <label className="block mb-1 text-sm text-gray-400">{t.notes}</label>
        <textarea
          name="notes"
          placeholder={t.notes}
          value={formData.notes}
          onChange={handleChange}
          className="w-full p-2 text-white border rounded bg-zinc-900 border-contrast"
        />
      </div>

      {/* Knapper */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 font-medium text-white rounded bg-accent hover:bg-pink-500"
        >
          {editData ? t.updateActivity : t.addActivity}
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
