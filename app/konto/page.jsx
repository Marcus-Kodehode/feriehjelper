"use client";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";
import AccountPlaceholder from "@/components/account/AccountPlaceholder";

export default function AccountPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="max-w-4xl p-6 mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-primary">{t.accountTitle}</h1>
      <AccountPlaceholder />
    </div>
  );
}
