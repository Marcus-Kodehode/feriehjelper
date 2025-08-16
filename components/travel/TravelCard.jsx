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
import { ChevronDown } from "lucide-react";

export default function TravelCard({ trip, isNextTrip, defaultOpen = true, onEditTrip }) {
  const { deleteTrip } = useTravel();
  const { budgets } = useBudget();
  const { activities } = useActivity();
  const { emergencies } = useEmergency();
  const { language } = useLanguage();
  const t = translations[language];

  const [open, setOpen] = useState(!!defaultOpen);
  const [visDetaljer, setVisDetaljer] = useState(false);

  const daysLeft = Math.ceil((new Date(trip.from) - new Date()) / (1000 * 60 * 60 * 24));
  const length =
    Math.ceil((new Date(trip.to) - new Date(trip.from)) / (1000 * 60 * 60 * 24)) + 1;

  const budsjett = budgets.find((b) => Number(b.tripId) === trip.id);
  const currency = budsjett?.currency || "kr";
  const emergency = emergencies.find((e) => Number(e.tripId) === trip.id);

  const activityDate = (a) => {
    const time = a.time && a.time.trim() ? a.time : "23:59";
    return new Date(`${a.date}T${time}`);
  };

  const upcomingActivities = activities
    .filter((a) => Number(a.tripId) === trip.id && activityDate(a) >= new Date())
    .sort((a, b) => activityDate(a) - activityDate(b));
  const nextActivity = upcomingActivities[0];

  const cardBodyId = `trip-body-${trip.id}`;

  return (
    <div className="relative rounded-lg shadow-lg mb-4 border border-contrast bg-[#1f1f1f] text-footerText overflow-hidden">
      {/* HEADER */}
      <div className="relative px-4 pt-4 pb-12 sm:pb-8">
        {/* ØVRE HØYRE: Neste reise over – dager igjen under */}
        <div className="absolute flex flex-col items-end gap-1 top-3 right-3">
          {isNextTrip && (
            <span className="px-2 py-1 text-xs font-bold text-green-400 border border-green-500 rounded">
              {t.nextTrip}
            </span>
          )}
          <span className="text-xs font-semibold text-pink-400 whitespace-nowrap">
            {daysLeft} {t.daysLeft}
          </span>
        </div>


        {/* NEDRE HØYRE: Rediger / Slett (alltid i bunnen av header) */}
        <div className="absolute flex gap-2 right-3 bottom-3">
          {onEditTrip && (
            <button
              onClick={() => onEditTrip(trip)}
              className="px-3 py-1 text-xs btn-edit"
            >
              {t.edit}
            </button>
          )}
          <button
            onClick={() => deleteTrip(trip.id)}
            className="px-3 py-1 text-xs btn-delete"
          >
            {t.delete}
          </button>
        </div>

        {/* Venstresiden: toggle + tittel/datoer */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={cardBodyId}
          className="flex items-start gap-3 text-left group focus:outline-none"
        >
          <span className="inline-flex items-center justify-center w-6 h-6 mt-1 border rounded bg-zinc-800 border-contrast">
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-primary">{trip.title}</h2>
            <p className="text-xs text-gray-300 sm:text-sm">{trip.destination}</p>
            <p className="text-xs text-gray-400 sm:text-sm">
              {trip.from} – {trip.to} · {t.duration}: {length} {t.days}
            </p>
          </div>
        </button>
      </div>

      {/* KOLLAPS-INNHOLD */}
      {open && (
        <div id={cardBodyId} className="px-4 pb-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            {/* Venstre kolonne */}
            <div className="flex flex-col flex-1 gap-2">
              {trip.notes && <p className="mt-1 text-sm italic text-gray-400">{trip.notes}</p>}
              {trip.travelers && (
                <p className="text-sm italic text-gray-400">
                  {trip.travelers} {t.travelers}
                </p>
              )}

              {/* Budsjett */}
              {budsjett && (
                <div className="mt-3 p-3 bg-[#2a2a2a] border border-yellow-500 rounded-md space-y-1">
                  <p className="text-sm font-bold text-yellow-300">{t.budget}</p>
                  <p className="text-sm text-gray-300">{t.total}: {budsjett.amount} {currency}</p>
                  {budsjett.daily && (
                    <p className="text-sm text-gray-300">{t.daily}: {budsjett.daily} {currency}</p>
                  )}
                  {budsjett.transport && (
                    <p className="text-sm text-gray-300">{t.transport}: {budsjett.transport} {currency}</p>
                  )}
                  {budsjett.accommodation && (
                    <p className="text-sm text-gray-300">{t.accommodation}: {budsjett.accommodation} {currency}</p>
                  )}
                  {budsjett.food && <p className="text-sm text-gray-300">{t.food}: {budsjett.food} {currency}</p>}
                  {budsjett.activities && (
                    <p className="text-sm text-gray-300">{t.activities}: {budsjett.activities} {currency}</p>
                  )}
                  {budsjett.misc && <p className="text-sm text-gray-300">{t.misc}: {budsjett.misc} {currency}</p>}
                  {budsjett.notes && <p className="text-sm italic text-gray-400">{budsjett.notes}</p>}
                  <BudgetMiniChart budget={budsjett} />
                </div>
              )}

              {/* Neste aktivitet */}
              {nextActivity && (
                <div className="mt-3 p-3 bg-[#2a2a2a] border border-green-500 rounded-md space-y-1">
                  <p className="text-sm font-bold text-green-300">{t.nextActivity}</p>
                  <p className="text-sm text-white">{nextActivity.name}</p>
                  <p className="text-sm text-gray-400">
                    {nextActivity.date}
                    {nextActivity.time && ` ${t.at} ${nextActivity.time}`}
                  </p>
                  {nextActivity.place && (
                    <p className="text-sm text-gray-300">{t.place}: {nextActivity.place}</p>
                  )}
                </div>
              )}

              {/* Nødinformasjon (utdrag) */}
              {emergency && (
                <div className="mt-3 p-3 bg-[#2a2a2a] border border-red-500 rounded-md space-y-1">
                  <p className="text-sm font-bold text-red-400">{t.emergency}</p>
                  {emergency.police && <p className="text-sm text-gray-300">{t.police}: {emergency.police}</p>}
                  {emergency.ambulance && <p className="text-sm text-gray-300">{t.ambulance}: {emergency.ambulance}</p>}
                  {emergency.fire && <p className="text-sm text-gray-300">{t.fire}: {emergency.fire}</p>}
                  {emergency.notes && <p className="text-sm italic text-gray-400">{emergency.notes}</p>}
                </div>
              )}

              <button onClick={() => setVisDetaljer(true)} className="mt-2 text-xs underline text-accent w-fit">
                {t.viewDetails}
              </button>
            </div>
          </div>
        </div>
      )}

      {visDetaljer && <TravelDetails trip={trip} onClose={() => setVisDetaljer(false)} />}
    </div>
  );
}

// TravelCard er en sentral komponent som viser én enkelt reise i en oversikt.
// Den henter og viser relatert informasjon som budsjett, neste aktivitet og nødinformasjon
// ved hjelp av ulike kontekster (Travel, Budget, Activity, Emergency).
// Kortet viser også antall dager igjen til reisen starter og reiselengde,
// og gir mulighet for å vise flere detaljer via TravelDetails-komponenten.
// Brukeren kan også slette reisen direkte fra kortet.
// Komponentens innhold er dynamisk basert på hva slags data som finnes for reisen.
