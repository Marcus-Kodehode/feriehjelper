"use client";
import Image from "next/image";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  // Navn avhengig av språk
  const appName = language === "no" ? "Feriehjelper" : "VacationHelper";

  return (
    <footer className="px-6 py-8 mt-12 border-t bg-footer text-footerText border-contrast">
      <div className="flex flex-col items-center justify-between max-w-6xl gap-4 mx-auto text-sm md:flex-row">
        {/* Venstre: Logo + navn */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt={`${appName} logo`}
            width={42}
            height={42}
            className="rounded-sm"
          />
          <span className="text-lg font-bold text-white">{appName}</span>
        </div>

        {/* Midt: tekst */}
        <div className="text-center text-gray-400 md:text-left">
          <p>© {new Date().getFullYear()} {appName}. {t.rightsReserved}</p>
          <p>
            {t.builtWith} <span className="text-primary">Next.js</span> & Tailwind CSS
          </p>
        </div>

        {/* Høyre: ekstra info */}
        <div className="hidden text-xs italic text-gray-500 md:block">
          vacationhelper.app
        </div>
      </div>
    </footer>
  );
}
