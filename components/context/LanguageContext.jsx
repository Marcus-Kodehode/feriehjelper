"use client";
import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("no"); // standard: norsk

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "no" ? "en" : "no"));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
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
