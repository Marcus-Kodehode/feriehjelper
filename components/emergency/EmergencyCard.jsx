"use client";
import { useEmergency } from "../context/EmergencyContext";
import { useTravel } from "../context/TravelContext";
import { useLanguage } from "../context/LanguageContext";
import translations from "../lang/translations";

export default function EmergencyCard() {
  const { emergencies, deleteEmergency } = useEmergency();
  const { trips } = useTravel();
  const { language } = useLanguage();
  const t = translations[language];

  if (!emergencies.length)
    return <p className="text-gray-400">{t.noEmergencyInfo}</p>;

  return (
    <div className="space-y-4">
      {emergencies.map((e) => {
        const trip = trips.find((t) => t.id === Number(e.tripId));

        return (
          <div
            key={e.id}
            className="relative p-4 border rounded-lg border-contrast bg-[#1f1f1f]"
          >
            <h3 className="mb-1 text-lg font-semibold text-primary">
              {trip ? trip.title : t.unknownTrip}
            </h3>

            {e.embassy && (
              <p className="text-sm text-gray-300">
                {t.embassyLabel}: {e.embassy}
              </p>
            )}
            {e.police && (
              <p className="text-sm text-gray-300">
                {t.policeLabel}: {e.police}
              </p>
            )}
            {e.ambulance && (
              <p className="text-sm text-gray-300">
                {t.ambulanceLabel}: {e.ambulance}
              </p>
            )}
            {e.fire && (
              <p className="text-sm text-gray-300">
                {t.fireLabel}: {e.fire}
              </p>
            )}
            {e.insuranceCompany && (
              <p className="text-sm text-gray-300">
                {t.insuranceLabel}: {e.insuranceCompany}
              </p>
            )}
            {e.policyNumber && (
              <p className="text-sm text-gray-300">
                {t.policyLabel}: {e.policyNumber}
              </p>
            )}
            {e.emergencyContact && (
              <p className="text-sm text-gray-300">
                {t.contactPersonLabel}: {e.emergencyContact}
              </p>
            )}
            {e.notes && (
              <p className="mt-1 text-sm italic text-gray-400">📝 {e.notes}</p>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => alert("Redigering kommer snart!")}
                className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                {t.edit}
              </button>
              <button
                onClick={() => deleteEmergency(e.id)}
                className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
              >
                {t.delete}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
// EmergencyCard viser en oversikt over lagret nødinformasjon per reise.
// Data hentes fra EmergencyContext, og reisetitler kobles via TravelContext.
// Hver kortseksjon viser kun feltene som faktisk er fylt ut, og inkluderer mulighet for å slette (og etter hvert redigere).
// Språk og etiketter hentes fra LanguageContext for støtte for flere språk.
// Brukervennlig layout med god kontrast og tydelig gruppering av informasjon.
