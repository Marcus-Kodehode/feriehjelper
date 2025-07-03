"use client";
import Link from "next/link";
import { useState } from "react";
import { X, Menu } from "lucide-react";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  const navLinks = [
    { href: "/", label: t.dashboard },
    { href: "/reiser", label: t.trips },
    { href: "/budsjett", label: t.budget },
    { href: "/aktiviteter", label: t.activities },
    { href: "/konto", label: t.account },
    { href: "/emergency", label: t.emergency, danger: true },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-white md:hidden"
        aria-label="Open menu"
      >
        <Menu size={28} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 text-white bg-header">
          <button
            onClick={() => setOpen(false)}
            className="absolute text-white top-4 right-4"
            aria-label="Close menu"
          >
            <X size={32} />
          </button>

          {navLinks.map(({ href, label, danger }) => (
            <Link
              key={href}
              href={href}
              className={`text-xl font-semibold px-4 py-2 rounded ${
                danger
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-teal-700 hover:bg-teal-600"
              } transition`}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}

          <button
            onClick={() => {
              toggleLanguage();
              setOpen(false);
            }}
            className="px-4 py-2 mt-4 text-sm bg-gray-700 rounded hover:bg-gray-600"
          >
            {language === "no" ? "English" : "Norsk"}
          </button>
        </div>
      )}
    </>
  );
}
