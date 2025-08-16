"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext({
  language: "no",
  setLanguage: () => {},
  toggleLanguage: () => {},
  available: [],
});

const ORDER = ["no", "en", "es"]; // legg til "zh" senere

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "no";
    return localStorage.getItem("vh_lang") || "no";
  });

  useEffect(() => {
    try {
      localStorage.setItem("vh_lang", language);
    } catch {}
  }, [language]);

  // Behold toggle, men gjør den flerspråklig (no -> en -> es -> no)
  const toggleLanguage = () => {
    const i = ORDER.indexOf(language);
    const next = ORDER[(i + 1) % ORDER.length] || "no";
    setLanguage(next);
  };

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, available: ORDER }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// LanguageContext styrer hvilket språk som er aktivt i appen (norsk eller engelsk).
// Brukeren kan bytte språk med toggleLanguage, som veksler mellom "no" og "en".
// Tilstanden lagres i minnet (useState), og deles globalt via LanguageProvider.
// Alle komponenter som bruker useLanguage() får tilgang til valgt språk og funksjon for å endre det.
// Dette gir enkel og fleksibel språkstyring gjennom hele applikasjonen.
