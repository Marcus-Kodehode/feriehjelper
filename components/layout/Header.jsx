"use client"; // 👈 Denne må med øverst!

import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./MobileMenu";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 px-4 py-3 shadow-md bg-header">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        {/* Logo & navn */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/images/logoT.png"
            alt="VacationHelper Logo"
            width={32}
            height={32}
            className="transition-transform duration-300 group-hover:rotate-6"
          />
          <span className="text-xl font-bold">
            <span className="text-accent">Vacation</span>
            <span className="text-green-400">Helper</span>
          </span>
        </Link>

        {/* Navigasjon (PC) */}
        <nav className="items-center hidden gap-3 text-sm font-medium md:flex">
          <Link href="/" className="nav-btn">{t.dashboard}</Link>
          <Link href="/reiser" className="nav-btn">{t.trips}</Link>
          <Link href="/budsjett" className="nav-btn">{t.budget}</Link>
          <Link href="/aktiviteter" className="nav-btn">{t.activities}</Link>
          <Link href="/konto" className="nav-btn">{t.account}</Link>
          <Link href="/nødinformasjon" className="bg-red-600 nav-btn hover:bg-red-700">
            {t.emergency}
          </Link>

          {/* Bytt språk knapp */}
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 text-xs text-white border rounded border-contrast hover:bg-gray-800"
          >
            {language === "no" ? "English" : "Norsk"}
          </button>
        </nav>

        {/* Mobilmeny */}
        <MobileMenu />
      </div>
    </header>
  );
}
