"use client";
import { useState } from "react";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

import ActivityForm from "@/components/activity/ActivityForm";
import GroupedActivityList from "@/components/activity/GroupedActivityList";

export default function ActivityPage() {
  const [editData, setEditData] = useState(null);
  const { language } = useLanguage();
  const t = translations[language];

  const handleEdit = (activity) => {
    setEditData(activity);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearEdit = () => {
    setEditData(null);
  };

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-4xl p-6">
        <h1 className="mb-4 text-2xl font-bold text-primary">{t.myActivities}</h1>

        <GroupedActivityList onEdit={handleEdit} />
        <ActivityForm editData={editData} clearEdit={clearEdit} />
      </div>
    </div>
  );
}
// ActivityPage viser brukerens planlagte aktiviteter, gruppert etter reise.
// Øverst vises en liste (GroupedActivityList) med alle aktiviteter, hvor brukeren kan trykke "rediger".
// Når en aktivitet skal redigeres, settes data i editData, og skjemaet scroller opp og fylles ut.
// ActivityForm brukes både for å opprette og redigere aktiviteter, avhengig av om editData finnes.
// Språk styres via LanguageContext, og siden er responsivt bygget med Tailwind CSS.
