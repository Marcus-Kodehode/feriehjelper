"use client";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function AccountPlaceholder() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="p-4 border rounded border-contrast bg-zinc-900 text-footerText">
      <p>{t.accountComing}</p>
    </div>
  );
}
