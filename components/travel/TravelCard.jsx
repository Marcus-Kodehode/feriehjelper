"use client";
import { useState } from "react";
import { useTravel } from "@/components/context/TravelContext";
import { useBudget } from "@/components/context/BudgetContext";
import { useActivity } from "@/components/context/ActivityContext";
import { useEmergency } from "@/components/context/EmergencyContext";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";
import TravelDetails from "@/components/travel/details/TravelDetails";
import BudgetMiniChart from "@/components/budget/BudgetMiniChart";


export default function TravelCard({ trip, isNextTrip }) {
  const { deleteTrip } = useTravel();
  const { budgets } = useBudget();
  const { activities } = useActivity();
  const { emergencies } = useEmergency();
  const { language } = useLanguage();
  const t = translations[language];
  const [visDetaljer, setVisDetaljer] = useState(false);

  const daysLeft = Math.ceil((new Date(trip.from) - new Date()) / (1000 * 60 * 60 * 24));
  const length = Math.ceil((new Date(trip.to) - new Date(trip.from)) / (1000 * 60 * 60 * 24)) + 1;

  const budsjett = budgets.find((b) => Number(b.tripId) === trip.id);
  const currency = budsjett?.currency || "kr";
  const emergency = emergencies.find((e) => Number(e.tripId) === trip.id);

  const upcomingActivities = activities
    .filter(
      (a) =>
        Number(a.tripId) === trip.id &&
        new Date(a.date + "T" + (a.time || "00:00")) >= new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.date + "T" + (a.time || "00:00")) - new Date(b.date + "T" + (b.time || "00:00"))
    );

  const nextActivity = upcomingActivities[0];

  return (
    <>
      <div className="relative bg-[#1f1f1f] text-footerText p-4 rounded-lg shadow-lg mb-4 border border-contrast flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col flex-1 gap-2">
          <div>
            <h2 className="text-lg font-semibold text-primary">{trip.title}</h2>
            <p className="text-sm text-gray-300">{trip.destination}</p>
            <p className="text-sm text-gray-400">{trip.from} – {trip.to}</p>
            <p className="text-sm italic text-gray-400">{t.duration}: {length} {t.days}</p>

            {trip.notes && (
              <p className="mt-1 text-sm italic text-gray-400">{trip.notes}</p>
            )}
            {trip.travelers && (
              <p className="text-sm italic text-gray-400">{trip.travelers} {t.travelers}</p>
            )}
          </div>

          {budsjett && (
            <div className="mt-3 p-3 bg-[#2a2a2a] border border-yellow-500 rounded-md space-y-1">
              <p className="text-sm font-bold text-yellow-300">{t.budget}</p>
              <p className="text-sm text-gray-300">{t.total}: {budsjett.amount} {currency}</p>
              {budsjett.daily && <p className="text-sm text-gray-300">{t.daily}: {budsjett.daily} {currency}</p>}
              {budsjett.transport && <p className="text-sm text-gray-300">{t.transport}: {budsjett.transport} {currency}</p>}
              {budsjett.accommodation && <p className="text-sm text-gray-300">{t.accommodation}: {budsjett.accommodation} {currency}</p>}
              {budsjett.food && <p className="text-sm text-gray-300">{t.food}: {budsjett.food} {currency}</p>}
              {budsjett.activities && <p className="text-sm text-gray-300">{t.activities}: {budsjett.activities} {currency}</p>}
              {budsjett.misc && <p className="text-sm text-gray-300">{t.misc}: {budsjett.misc} {currency}</p>}
              {budsjett.notes && <p className="text-sm italic text-gray-400">{budsjett.notes}</p>}
              <BudgetMiniChart budget={budsjett} />
            </div>
          )}

          {nextActivity && (
            <div className="mt-3 p-3 bg-[#2a2a2a] border border-green-500 rounded-md space-y-1">
              <p className="text-sm font-bold text-green-300">{t.nextActivity}</p>
              <p className="text-sm text-white">{nextActivity.name}</p>
              <p className="text-sm text-gray-400">
                {nextActivity.date}
                {nextActivity.time && ` kl. ${nextActivity.time}`}
              </p>
              {nextActivity.place && (
                <p className="text-sm text-gray-300">{t.place}: {nextActivity.place}</p>
              )}
            </div>
          )}

          {emergency && (
            <div className="mt-3 p-3 bg-[#2a2a2a] border border-red-500 rounded-md space-y-1">
              <p className="text-sm font-bold text-red-400">{t.emergency}</p>
              {emergency.police && <p className="text-sm text-gray-300">{t.police}: {emergency.police}</p>}
              {emergency.ambulance && <p className="text-sm text-gray-300">{t.ambulance}: {emergency.ambulance}</p>}
              {emergency.fire && <p className="text-sm text-gray-300">{t.fire}: {emergency.fire}</p>}
              {emergency.notes && <p className="text-sm italic text-gray-400">{emergency.notes}</p>}
            </div>
          )}

          <button
            onClick={() => setVisDetaljer(true)}
            className="mt-2 text-xs underline text-accent w-fit"
          >
            {t.viewDetails}
          </button>
        </div>

        <div className="flex flex-col items-end justify-between gap-2">
          {isNextTrip && (
            <span className="px-2 py-1 text-xs font-bold text-green-400 border border-green-500 rounded">
              {t.nextTrip}
            </span>
          )}
          <span className="text-sm font-semibold text-pink-400">{daysLeft} {t.daysLeft}</span>
          <button
            onClick={() => deleteTrip(trip.id)}
            className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
          >
            {t.delete}
          </button>
        </div>
      </div>

      {visDetaljer && <TravelDetails trip={trip} onClose={() => setVisDetaljer(false)} />}
    </>
  );
}
// TravelCard er en sentral komponent som viser én enkelt reise i en oversikt.
// Den henter og viser relatert informasjon som budsjett, neste aktivitet og nødinformasjon
// ved hjelp av ulike kontekster (Travel, Budget, Activity, Emergency).
// Kortet viser også antall dager igjen til reisen starter og reiselengde,
// og gir mulighet for å vise flere detaljer via TravelDetails-komponenten.
// Brukeren kan også slette reisen direkte fra kortet.
// Komponentens innhold er dynamisk basert på hva slags data som finnes for reisen.
