"use client";
import { useLanguage } from "../context/LanguageContext";
import translations from "../lang/translations";

export default function AccountPlaceholder() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="p-4 border rounded border-contrast bg-zinc-900 text-footerText">
      <p>{t.accountComing}</p>
    </div>
  );
}
