"use client";
import { useTravel } from "../context/TravelContext";
import { useLanguage } from "../context/LanguageContext";
import translations from "../lang/translations";

export default function EmergencyCard({ data, onEdit, onDelete }) {
  const { trips } = useTravel();
  const { language } = useLanguage();
  const t = translations[language];

  const trip = trips.find((tr) => tr.id === Number(data.tripId));

  return (
    <div className="relative p-4 border rounded-lg border-contrast bg-[#1f1f1f]">
      <h3 className="mb-1 text-lg font-semibold text-primary">
        {trip ? trip.title : t.unknownTrip}
      </h3>

      {data.embassy && <p className="text-sm text-gray-300">{t.embassyLabel}: {data.embassy}</p>}
      {data.police && <p className="text-sm text-gray-300">{t.policeLabel}: {data.police}</p>}
      {data.ambulance && <p className="text-sm text-gray-300">{t.ambulanceLabel}: {data.ambulance}</p>}
      {data.fire && <p className="text-sm text-gray-300">{t.fireLabel}: {data.fire}</p>}
      {data.insurance && <p className="text-sm text-gray-300">{t.insuranceLabel}: {data.insurance}</p>}
      {data.policyNumber && <p className="text-sm text-gray-300">{t.policyLabel}: {data.policyNumber}</p>}
      {data.contactPerson && <p className="text-sm text-gray-300">{t.contactPersonLabel}: {data.contactPerson}</p>}
      {data.notes && <p className="mt-1 text-sm italic text-gray-400">📝 {data.notes}</p>}

      {/* Knappene: nederst-høyre på mobil, øverst-høyre på desktop */}
      <div className="flex justify-end w-full gap-2 mt-3 sm:w-auto sm:justify-start sm:mt-0 sm:absolute sm:top-2 sm:right-3">
        <button onClick={() => onEdit?.(data)} className="px-2 py-1 text-xs btn-edit sm:px-3 sm:py-1 sm:text-sm">
          {t.edit}
        </button>
        <button onClick={() => onDelete?.(data.id)} className="px-2 py-1 text-xs btn-delete sm:px-3 sm:py-1 sm:text-sm">
          {t.delete}
        </button>
      </div>
    </div>
  );
}

// EmergencyCard viser en oversikt over lagret nødinformasjon per reise.
// Data hentes fra EmergencyContext, og reisetitler kobles via TravelContext.
// Hver kortseksjon viser kun feltene som faktisk er fylt ut, og inkluderer mulighet for å slette (og etter hvert redigere).
// Språk og etiketter hentes fra LanguageContext for støtte for flere språk.
// Brukervennlig layout med god kontrast og tydelig gruppering av informasjon.
