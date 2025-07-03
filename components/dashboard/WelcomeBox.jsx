"use client";
import Link from "next/link";
import { useTravel } from "@/components/context/TravelContext";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function WelcomeBox() {
  const { trips } = useTravel();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="p-6 bg-[#1f1f1f] border border-contrast rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold text-accent">{t.welcomeTitle}</h2>
      <p className="text-gray-300">{t.welcomeMessage}</p>

      {!trips.length && (
        <Link href="/reiser#travel-form">
          <button className="px-4 py-2 font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600">
            {t.planYourFirstTrip}
          </button>
        </Link>
      )}

      {/* Neste steg / tips */}
      <div className="pt-4 mt-4 border-t border-gray-700">
        <h3 className="font-semibold text-yellow-400">{t.nextStepsTitle}</h3>
        <ul className="pl-4 space-y-1 text-sm text-gray-400 list-disc">
          <li>{t.nextSteps.activities}</li>
          <li>{t.nextSteps.budget}</li>
          <li>{t.nextSteps.emergency}</li>
        </ul>
      </div>
    </div>
  );
}
