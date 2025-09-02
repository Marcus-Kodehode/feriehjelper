"use client";

import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./MobileMenu";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";
import LanguageMenu from "@/components/shared/LanguageMenu";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Header() {
  const { language } = useLanguage();
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
          <Link href="/" className="nav-btn">
            {t.dashboard}
          </Link>
          <Link href="/reiser" className="nav-btn">
            {t.trips}
          </Link>
          <Link href="/budsjett" className="nav-btn">
            {t.budget}
          </Link>
          <Link href="/aktiviteter" className="nav-btn">
            {t.activities}
          </Link>
          <Link href="/konto" className="nav-btn">
            {t.account}
          </Link>
          <Link
            href="/emergency"
            className="bg-red-600 nav-btn hover:bg-red-700"
          >
            {t.emergency}
          </Link>

          {/* Språkmeny (flagg + navn) */}
          <LanguageMenu />
        </nav>
        <SignedOut>
          <a href="/sign-in" className="btn">
            Logg inn
          </a>
          <a href="/sign-up" className="btn btn-secondary">
            Registrer
          </a>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        {/* Mobilmeny */}
        <MobileMenu />
      </div>
    </header>
  );
}

// Header-komponenten viser topplinjen på siden med logo, navigasjonslenker og språkvelger.
// Den bruker valgt språk fra LanguageContext til å vise oversatte lenketitler.
// På større skjermer vises en full meny, mens MobileMenu brukes for mobilvisning.
// Logoen er klikkbar og går tilbake til forsiden. Styling gjøres med Tailwind CSS.
