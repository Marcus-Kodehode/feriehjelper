"use client";

import { useState } from "react";
import { useEmergency } from "@/components/context/EmergencyContext";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

import EmergencyCard from "@/components/emergency/EmergencyCard";
import EmergencyForm from "@/components/emergency/EmergencyForm";

export default function EmergencyPage() {
  const { emergencies, deleteEmergency } = useEmergency();
  const { language } = useLanguage();
  const t = translations[language];

  const [editData, setEditData] = useState(null);

  const handleEdit = (row) => {
    setEditData(row);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearEdit = () => setEditData(null);

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-4xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-accent">{t.emergencyTitle}</h1>

                {/* Liste med lagrede nødinformasjoner */}
        <div className="space-y-4">
          {emergencies.length === 0 ? (
            <p className="text-gray-400">{t.noEmergencyInfo}</p>
          ) : (
            emergencies.map((e) => (
              <EmergencyCard
                key={e.id}
                data={e}
                onEdit={handleEdit}
                onDelete={(id) => deleteEmergency(id)}
              />
            ))
          )}
        </div>

        {/* Skjema for legg til / rediger */}
        <EmergencyForm editData={editData} clearEdit={clearEdit} />
      </div>
    </div>
  );
}

// EmergencyPage viser nødinformasjon knyttet til brukerens reiser, f.eks. politi, ambulanse, forsikring og kontaktperson.
// Den bruker LanguageContext for å oversette innhold basert på valgt språk.
// EmergencyCard viser lagrede nødinformasjoner, og EmergencyForm brukes for å legge til eller redigere dem.
// Alt er pakket inn i en responsiv layout med fokus på oversikt og brukervennlighet.
// Dette gir brukeren enkel tilgang til viktig informasjon i krisesituasjoner.
