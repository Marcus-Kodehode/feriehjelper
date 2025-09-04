"use client";
import { useEffect, useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { useActivity } from "../../context/ActivityContext";
import { useEmergency } from "../../context/EmergencyContext";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../lang/translations";
import BudgetMiniChart from "../../budget/BudgetMiniChart";

export default function TravelDetails({ trip, onClose }) {
  const { language } = useLanguage();
  const t = translations[language];

  const { budgets } = useBudget();
  const { activities } = useActivity();
  const { emergencies } = useEmergency();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!trip) return null;

  const length =
    Math.ceil((new Date(trip.to) - new Date(trip.from)) / (1000 * 60 * 60 * 24)) + 1;
  const daysLeft = Math.ceil((new Date(trip.from) - new Date()) / (1000 * 60 * 60 * 24));

  const budsjett = budgets.find((b) => Number(b.tripId) === trip.id);
  const currency = budsjett?.currency || "kr";
  const emergency = emergencies.find((e) => Number(e.tripId) === trip.id);

  const hasExpenses =
    budsjett?.transport ||
    budsjett?.accommodation ||
    budsjett?.food ||
    budsjett?.activities ||
    budsjett?.misc;

  const allActivities = activities
    .filter((a) => Number(a.tripId) === trip.id)
    .sort(
      (a, b) =>
        new Date(a.date + "T" + (a.time || "00:00")) -
        new Date(b.date + "T" + (b.time || "00:00"))
    );

  const visibleActivities = showAll ? allActivities : allActivities.slice(0, 2);

  // map enum/legacy-kategori -> oversatt nøkkel
  const codeToLabelKey = (codeOrLegacy) => {
    const map = {
      sight: "sight",
      restaurant: "restaurant",
      excursion: "excursion",
      transport: "transport",
      other: "other",
      // legacy norsk
      Severdighet: "sight",
      Restaurant: "restaurant",
      Utflukt: "excursion",
      Transport: "transport",
      Annet: "other",
    };
    return map[codeOrLegacy] || "other";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative w-full max-w-xl p-6 mx-4 border rounded-lg shadow-lg bg-dark border-contrast text-footerText max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute z-50 px-3 py-1 text-sm text-white bg-red-600 rounded top-4 right-2 hover:bg-red-700"
        >
          {t.close}
        </button>

        <h2 className="mb-2 text-2xl font-bold text-primary">{trip.title}</h2>
        <p className="text-sm text-gray-300">{trip.destination}</p>
        <p className="text-sm text-gray-400">
          {trip.from} – {trip.to}
        </p>
        <p className="mb-2 text-sm italic text-gray-400">
          {t.duration}: {length} {t.days} ({daysLeft} {t.daysLeft})
        </p>

        {trip.transport && (
          <p className="text-sm text-gray-300">
            <span className="font-semibold">{t.transport}:</span> {trip.transport}
          </p>
        )}
        {trip.stay && (
          <p className="text-sm text-gray-300">
            <span className="font-semibold">{t.stay}:</span> {trip.stay}
          </p>
        )}
        {trip.travelers && (
          <p className="text-sm text-gray-300">
            <span className="font-semibold">{t.travelers}:</span> {trip.travelers}
          </p>
        )}
        {trip.notes && (
          <div className="mt-2">
            <p className="text-sm font-semibold text-gray-300">{t.notes}:</p>
            <p className="text-sm italic text-gray-400">{trip.notes}</p>
          </div>
        )}

        {budsjett && (
          <div className="mt-4 p-3 border rounded border-yellow-500 bg-[#2a2a2a] space-y-1">
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
            {budsjett.food && (
              <p className="text-sm text-gray-300">{t.food}: {budsjett.food} {currency}</p>
            )}
            {budsjett.activities && (
              <p className="text-sm text-gray-300">{t.activities}: {budsjett.activities} {currency}</p>
            )}
            {budsjett.misc && (
              <p className="text-sm text-gray-300">{t.misc}: {budsjett.misc} {currency}</p>
            )}
            {budsjett.notes && (
              <p className="text-sm italic text-gray-400">{budsjett.notes}</p>
            )}
            {hasExpenses && (
              <div className="mt-3">
                <BudgetMiniChart budget={budsjett} />
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-2 text-lg font-bold text-green-400">{t.plannedActivities}</h3>
          {visibleActivities.length === 0 ? (
            <p className="text-sm text-gray-400">{t.noActivities}</p>
          ) : (
            <>
              <ul className="space-y-2">
                {visibleActivities.map((a) => (
                  <li key={a.id} className="p-3 border rounded border-contrast bg-zinc-900">
                    <p className="font-semibold text-primary">{a.name}</p>
                    <p className="text-sm text-gray-400">
                      {a.date} {a.time && `${t.at} ${a.time}`}
                    </p>
                    {a.place && <p className="text-sm text-gray-300">{t.place}: {a.place}</p>}
                    {a.cost && (
                      <p className="text-sm text-gray-300">{t.cost}: {a.cost} {currency}</p>
                    )}
                    {a.category && (
                      <p className="text-sm italic text-gray-400">
                        {t.category}: {t[codeToLabelKey(a.category)]}
                      </p>
                    )}
                    {a.notes && (
                      <p className="text-sm italic text-gray-400">📝 {a.notes}</p>
                    )}
                    {a.link && (
                      <a href={a.link} target="_blank" className="text-sm text-pink-400 underline">
                        {t.moreInfo}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              {allActivities.length > 2 && (
                <button
                  onClick={() => setShowAll((prev) => !prev)}
                  className="mt-3 text-sm underline text-accent"
                >
                  {showAll ? t.showLess : t.showAll}
                </button>
              )}
            </>
          )}
        </div>

        {emergency && (
          <div className="mt-6 p-3 border rounded border-red-500 bg-[#2a2a2a] space-y-1">
            <h3 className="text-sm font-bold text-red-400">{t.emergencyInfo}</h3>
            {emergency.embassy && <p className="text-sm text-gray-300">{t.embassy}: {emergency.embassy}</p>}
            {emergency.police && <p className="text-sm text-gray-300">{t.police}: {emergency.police}</p>}
            {emergency.ambulance && <p className="text-sm text-gray-300">{t.ambulance}: {emergency.ambulance}</p>}
            {emergency.fire && <p className="text-sm text-gray-300">{t.fire}: {emergency.fire}</p>}
            {emergency.insurance && <p className="text-sm text-gray-300">{t.insurance}: {emergency.insurance}</p>}
            {emergency.policyNumber && <p className="text-sm text-gray-300">{t.policyNumber}: {emergency.policyNumber}</p>}
            {emergency.contactPerson && <p className="text-sm text-gray-300">{t.contactPerson}: {emergency.contactPerson}</p>}
            {emergency.notes && <p className="text-sm italic text-gray-400">{emergency.notes}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// TravelDetails viser en detaljert popup-visning av en valgt reise.
// Den henter og viser relaterte data fra Budsjett-, Aktivitet- og Nødinformasjon-contextene,
// samt oversettelser fra LanguageContext basert på valgt språk.
// Innholdet inkluderer reisedetaljer, budsjettoversikt (med diagram), planlagte aktiviteter
// og nødkontakt-informasjon. Det vises også antall dager igjen og lengden på reisen.
// ESC-tasten lukker popupen, og brukeren kan vise alle aktiviteter eller kun de to første.
// Designet er optimalisert for fokusert visning med mørkt tema og responsive elementer.
