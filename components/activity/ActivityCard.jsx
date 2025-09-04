"use client";
import { useTravel } from "../context/TravelContext";
import { useActivity } from "../context/ActivityContext";
import { useLanguage } from "../context/LanguageContext";
import translations from "../lang/translations";
import { categoryLabel } from "../utils/category";


export default function ActivityCard({ activity, onEdit }) {
  const { trips } = useTravel();
  const { deleteActivity } = useActivity();
  const { language } = useLanguage();
  const t = translations[language];

  const trip = trips.find((tt) => tt.id === Number(activity.tripId));

  return (
    <div className="relative bg-[#1f1f1f] text-footerText p-4 rounded-lg border border-contrast shadow mb-4">
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
        <p className="text-sm text-gray-400">
          {t.cost}: {activity.cost} {activity.currency || "kr"}
        </p>
      )}

       {activity.category && (
         <p className="text-sm italic text-gray-400">
           {t.category}: {categoryLabel(activity.category, t)}
         </p>
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

      {/* Knappene: nederst-høyre på mobil, øverst-høyre på desktop */}
      <div className="flex justify-end w-full gap-2 mt-3 sm:w-auto sm:justify-start sm:mt-0 sm:absolute sm:top-2 sm:right-3">
        <button
          onClick={() => onEdit(activity)}
          className="px-2 py-1 text-xs btn-edit sm:px-3 sm:py-1 sm:text-sm"
        >
          {t.edit}
        </button>
        <button
          onClick={() => deleteActivity(activity.id)}
          className="px-2 py-1 text-xs btn-delete sm:px-3 sm:py-1 sm:text-sm"
        >
          {t.delete}
        </button>
      </div>
    </div>
  );
}

// ActivityCard viser en enkelt aktivitet med all viktig info: navn, reise, tid, sted, kostnad osv.
// Brukeren kan redigere eller slette aktiviteten via knappene øverst i kortet.
// Henter reisetittel fra TravelContext og tekstoversettelser fra LanguageContext.
// Visningen tilpasses automatisk ut fra hvilke felter som er fylt ut.
// Designet med mørk bakgrunn og kontrastfarger for tydelig visning.
