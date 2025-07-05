"use client";
import { useState } from "react";
import TravelForm from "@/components/travel/TravelForm";
import TravelSummary from "@/components/dashboard/TravelSummary";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function ReiserPage() {
  const [visSkjema, setVisSkjema] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h1 className="mb-4 text-2xl font-bold text-primary">{t.myTrips}</h1>

      {/* VIS ALLE REISEKORT */}
      <TravelSummary />

      {/* KNAPP FOR Å VISE / SKJULE SKJEMA */}
      <div className="my-6">
        <button
          onClick={() => setVisSkjema(!visSkjema)}
          className="px-4 py-2 text-white transition rounded bg-accent hover:bg-pink-500"
        >
          {visSkjema ? t.hideForm : t.addTrip}
        </button>
      </div>

      {/* SKJEMA FOR Å REGISTRERE REISE */}
      {visSkjema && (
        <div className="p-6 bg-transparent border rounded-lg border-contrast">
          <TravelForm />
        </div>
      )}
    </div>
  );
}
// ReiserPage viser oversikten over brukerens reiser og lar brukeren legge til nye.
// Den bruker språkvalg fra LanguageContext for å vise tekst på valgt språk.
// TravelSummary viser alle registrerte reiser, og en knapp lar brukeren vise/skjule TravelForm.
// TravelForm vises kun når "visSkjema" er aktivert, og lar brukeren registrere en ny reise.
// Designet er sentrert og responsivt, med Tailwind CSS for styling.
