"use client";
import { useTravel } from "../context/TravelContext";
import TravelCard from "../travel/TravelCard";
import WelcomeBox from "./WelcomeBox";
import { useLanguage } from "../context/LanguageContext";
import translations from "../lang/translations";
export default function TravelSummary({ onEditTrip }) {  // ← ta imot handler
  const { trips } = useTravel();
  const { language } = useLanguage();
  const t = translations[language];

  const today = new Date();
  const sortedTrips = trips.slice().sort((a, b) => new Date(a.from) - new Date(b.from));
  const nextTrip = sortedTrips.find((trip) => new Date(trip.from) > today);

  if (trips.length === 0) {
    return <WelcomeBox />;
  }

  return (
    <div className="grid gap-4 mt-4">
      <WelcomeBox nextTrip={nextTrip} />
      {sortedTrips.map((trip) => (
        <TravelCard
          key={trip.id}
          trip={trip}
          isNextTrip={trip.id === nextTrip?.id}
          onEditTrip={onEditTrip}  // ← send den videre til hvert kort
        />
      ))}
    </div>
  );
}

// TravelSummary viser en oversikt over alle registrerte reiser i appen.
// Reiser hentes fra TravelContext og sorteres etter startdato.
// Hvis det ikke finnes noen reiser, vises en velkomstboks (WelcomeBox) med introduksjon.
// Hvis det finnes reiser, vises WelcomeBox med informasjon om neste planlagte reise,
// etterfulgt av alle TravelCard-komponenter for hver reise, der neste reise markeres spesielt.
// Språktilpasning gjøres med LanguageContext, og layouten bruker Tailwind CSS.
