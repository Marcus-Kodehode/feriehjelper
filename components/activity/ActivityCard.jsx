"use client";
import { useTravel } from "@/components/context/TravelContext";
import { useActivity } from "@/components/context/ActivityContext";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function ActivityCard({ activity, onEdit }) {
  const { trips } = useTravel();
  const { deleteActivity } = useActivity();
  const { language } = useLanguage();
  const t = translations[language];

  const trip = trips.find((t) => t.id === Number(activity.tripId));

  return (
    <div className="relative bg-[#1f1f1f] text-footerText p-4 rounded-lg border border-contrast shadow mb-4">
    <div className="absolute flex gap-2 top-2 right-3">
      <button onClick={() => onEdit(activity)} className="btn-edit">
        {t.edit}
      </button>
      <button onClick={() => deleteActivity(activity.id)} className="btn-delete">
        {t.delete}
      </button>
    </div>

      <h3 className="text-lg font-semibold text-yellow-300">{activity.name}</h3>
      <p className="text-sm text-gray-400">
        {t.forTrip}: {trip ? trip.title : t.unknownTrip}
      </p>
      {activity.date && activity.time && (
        <p className="text-sm text-gray-400">
          {activity.date} {t.at} {activity.time}
        </p>
      )}
      {activity.place && (
        <p className="text-sm text-gray-400">{t.place}: {activity.place}</p>
      )}
      {activity.cost && (
        <p className="text-sm text-gray-400">{t.cost}: {activity.cost} {activity.currency || "kr"}</p>
      )}
      {activity.category && (
        <p className="text-sm italic text-gray-400">{t.category}: {activity.category}</p>
      )}
      {activity.notes && (
        <p className="text-sm italic text-gray-500">{activity.notes}</p>
      )}
      {activity.link && (
        <a
          href={activity.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-pink-400 underline"
        >
          {t.moreInfo}
        </a>
      )}
    </div>
  );
}
// ActivityCard viser en enkelt aktivitet med all viktig info: navn, reise, tid, sted, kostnad osv.
// Brukeren kan redigere eller slette aktiviteten via knappene øverst i kortet.
// Henter reisetittel fra TravelContext og tekstoversettelser fra LanguageContext.
// Visningen tilpasses automatisk ut fra hvilke felter som er fylt ut.
// Designet med mørk bakgrunn og kontrastfarger for tydelig visning.
