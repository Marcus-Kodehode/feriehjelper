"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/components/context/LanguageContext";

// Konfig: språk -> visningsnavn + flaggsti
const LANGS = {
  no: { name: "Norsk", flag: "/images/flags/no.png" },
  en: { name: "English", flag: "/images/flags/en.png" },
  es: { name: "Español", flag: "/images/flags/es.png" },
  zh: { name: "中文", flag: "/images/flags/zh.png" },
};

export default function LanguageMenu({ compact = false }) {
  const { language, setLanguage, available } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Klikk utenfor -> lukk
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = LANGS[language] ?? { name: language.toUpperCase(), flag: "" };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger-knapp */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border rounded px-2 py-1 hover:bg-gray-800 ${
          compact ? "text-xs" : "text-sm"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {current.flag ? (
          <Image
            src={current.flag}
            alt={current.name}
            width={18}
            height={12}
            className="rounded-sm"
          />
        ) : (
          <span>🌐</span>
        )}
        <span className="whitespace-nowrap">{current.name}</span>
      </button>

      {/* Meny */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-40 rounded border bg-[#1f1f1f] shadow-lg"
        >
          {available.map((code) => {
            const item = LANGS[code] ?? { name: code.toUpperCase(), flag: "" };
            const active = code === language;
            return (
              <button
                key={code}
                role="menuitem"
                onClick={() => {
                  setLanguage(code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-800 ${
                  active ? "opacity-90" : ""
                }`}
              >
                {item.flag ? (
                  <Image
                    src={item.flag}
                    alt={item.name}
                    width={18}
                    height={12}
                    className="rounded-sm"
                  />
                ) : (
                  <span>🌐</span>
                )}
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
