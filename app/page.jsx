"use client";

import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";
import WelcomeBox from "@/components/dashboard/WelcomeBox";
import TravelSummary from "@/components/dashboard/TravelSummary";

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="max-w-4xl p-6 mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-primary">{t.myDashboard}</h1>
      <WelcomeBox />
      <TravelSummary />
    </div>
  );
}
