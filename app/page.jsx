"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../components/context/LanguageContext";
import translations from "../components/lang/translations";
import TravelSummary from "../components/dashboard/TravelSummary";

// Samle rutene ett sted (norske slugs)
const ROUTES = {
  trip: "/reiser",
  budget: "/budsjett",
  activities: "/aktiviteter",
  emergency: "/emergency", // beholdt engelsk slug siden den finnes i prosjektet ditt
};

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  // Trip som skal redigeres (viser meny når denne ikke er null)
  const [tripToEdit, setTripToEdit] = useState(null);

  // Naviger til riktig side basert på valg
  const go = (where) => {
    if (!tripToEdit) return;

    switch (where) {
      case "trip":
        router.push(`${ROUTES.trip}?edit=${tripToEdit.id}`);
        break;
      case "budget":
        router.push(`${ROUTES.budget}?tripId=${tripToEdit.id}`);
        break;
      case "activities":
        router.push(`${ROUTES.activities}?tripId=${tripToEdit.id}`);
        break;
      case "emergency":
        router.push(`${ROUTES.emergency}?tripId=${tripToEdit.id}`);
        break;
      default:
        break;
    }
    setTripToEdit(null);
  };

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h1 className="mb-4 text-2xl font-bold text-primary">{t.myDashboard}</h1>

      {/* Viktig: send handler til TravelSummary/TravelCard */}
      <TravelSummary onEditTrip={(trip) => setTripToEdit(trip)} />

      {/* Enkel modal-meny når man trykker Rediger på et kort */}
      {tripToEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setTripToEdit(null)}
        >
          <div
            className="w-full max-w-sm p-4 border rounded-lg bg-[#1f1f1f] border-contrast text-footerText shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-lg font-semibold text-primary">
              {t.edit}: {tripToEdit.title}
            </h3>
            <p className="mb-4 text-sm text-gray-300">{t.viewDetails}?</p>

            <div className="grid gap-2">
              <button onClick={() => go("trip")} className="btn-edit">
                {t.trips}
              </button>
              <button
                onClick={() => go("budget")}
                className="px-2 py-1 text-xs text-white bg-yellow-600 rounded hover:bg-yellow-700"
              >
                {t.budget}
              </button>
              <button
                onClick={() => go("activities")}
                className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
              >
                {t.activities}
              </button>
              <button
                onClick={() => go("emergency")}
                className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
              >
                {t.emergency}
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setTripToEdit(null)}
                className="px-3 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// Denne komponenten er hovedsiden for brukerens dashboard.
// Den henter valgt språk fra LanguageContext, og bruker dette
// til å vise oversatt tittel. Komponentens innhold består av en overskrift
// og en TravelSummary-komponent som viser reiserelatert informasjon.
// Styling gjøres med Tailwind CSS, og komponenten er en Client Component.
