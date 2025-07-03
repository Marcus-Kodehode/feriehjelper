"use client";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";
import TravelSummary from "@/components/dashboard/TravelSummary";

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h1 className="mb-4 text-2xl font-bold text-primary">{t.myDashboard}</h1>
      <TravelSummary />
    </div>
  );
}
