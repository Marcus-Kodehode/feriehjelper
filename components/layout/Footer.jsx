"use client";
import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";
import translations from "../lang/translations";

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="px-6 py-6 mt-12 bg-footer text-footerText">
      <div className="flex flex-col items-center max-w-6xl mx-auto space-y-2 text-sm text-center">
        {/* Logo og navn med samme stil som header */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="VacationHelper Logo"
            width={32}
            height={32}
            className="transition-transform duration-300"
          />
          <span className="text-xl font-bold">
            <span className="text-accent">Vacation</span>
            <span className="text-green-400">Helper</span>
          </span>
        </div>

        {/* Tekst */}
        <p>© {new Date().getFullYear()} {language === "no" ? "Feriehjelper" : "VacationHelper"}. {t.rightsReserved}</p>
        <p>
          {t.builtWith} <span className="text-primary">Next.js</span> & Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
// Footer-komponenten viser bunnteksten for nettsiden.
// Den bruker valgt språk fra LanguageContext for å vise oversatt tekst,
// og viser logo, navn på appen, opphavsrett og informasjon om teknologier brukt.
// Styling gjøres med Tailwind CSS, og komponenten kjøres i klienten ("use client").
