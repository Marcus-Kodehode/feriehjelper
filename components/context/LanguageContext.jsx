"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext({
  language: "no",
  setLanguage: () => {},
  toggleLanguage: () => {},
  available: [],
});

const ORDER = ["no", "en", "es", "zh"];
const DEFAULT_LANG = "no";

export const LanguageProvider = ({ children }) => {
  // Viktig: ikke les localStorage her!
  const [language, setLanguage] = useState(DEFAULT_LANG);

  // Les localStorage ETTER hydrering
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vh_lang");
      if (stored && ORDER.includes(stored)) {
        setLanguage(stored);
      }
    } catch {}
  }, []);

  // Persistér når språk endres
  useEffect(() => {
    try {
      localStorage.setItem("vh_lang", language);
    } catch {}
  }, [language]);

  const toggleLanguage = () => {
    const i = ORDER.indexOf(language);
    const next = ORDER[(i + 1) % ORDER.length] || DEFAULT_LANG;
    setLanguage(next);
  };

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, available: ORDER }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}

// LanguageContext styrer hvilket språk som er aktivt i appen (norsk eller engelsk).
// Brukeren kan bytte språk med toggleLanguage, som veksler mellom "no" og "en".
// Tilstanden lagres i minnet (useState), og deles globalt via LanguageProvider.
// Alle komponenter som bruker useLanguage() får tilgang til valgt språk og funksjon for å endre det.
// Dette gir enkel og fleksibel språkstyring gjennom hele applikasjonen.
