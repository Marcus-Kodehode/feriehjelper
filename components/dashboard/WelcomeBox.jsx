"use client";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import translations from "../lang/translations";

export default function WelcomeBox({ nextTrip }) {
  const { language } = useLanguage();
  const t = translations[language];

  const noTripsYet = !nextTrip;

  return (
    <div className="p-6 border rounded-lg shadow bg-zinc-900 border-contrast">
      {noTripsYet ? (
        <>
          <h2 className="mb-2 text-xl font-bold text-accent">{t.welcomeTitle}</h2>
          <p className="mb-4 text-gray-300">{t.welcomeMessage}</p>
          <Link
            href="/reiser#reise-skjema"
            className="inline-block px-4 py-2 text-sm font-medium text-white transition rounded bg-accent hover:bg-pink-500"
          >
            {t.planYourFirstTrip}
          </Link>
        </>
      ) : (
        <>
          <h2 className="mb-2 text-xl font-bold text-green-400">{t.nextStepsTitle}</h2>
          <p className="mb-4 text-gray-300">
            {t.haveUpcomingTrip} <strong className="text-primary">{nextTrip.title}</strong>!
          </p>
          <ul className="pl-5 space-y-1 text-sm text-gray-400 list-disc">
            <li>{t.nextSteps.activities}</li>
            <li>{t.nextSteps.budget}</li>
            <li>{t.nextSteps.emergency}</li>
          </ul>
        </>
      )}
    </div>
  );
}
// WelcomeBox viser en velkomst- eller informasjonsboks øverst i dashbordet.
// Hvis brukeren ikke har noen reiser, vises en introduksjon med knapp for å planlegge sin første tur.
// Hvis en fremtidig reise finnes (nextTrip), vises en guide til neste steg: aktiviteter, budsjett og nødinformasjon.
// Tekster hentes dynamisk fra LanguageContext for støtte for flere språk.
// Layouten bruker Tailwind CSS for en moderne og responsiv utforming.
