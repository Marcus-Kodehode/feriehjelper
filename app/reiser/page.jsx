"use client";
import { useState } from "react";
import TravelForm from "@/components/travel/TravelForm";
import TravelSummary from "@/components/dashboard/TravelSummary";

export default function ReiserPage() {
  const [visSkjema, setVisSkjema] = useState(false);

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Mine reiser</h1>

      {/* VIS ALLE REISEKORT */}
      <TravelSummary />

      {/* KNAPP FOR Å VISE / SKJULE SKJEMA */}
      <div className="my-6">
        <button
          onClick={() => setVisSkjema(!visSkjema)}
          className="px-4 py-2 text-white transition rounded bg-accent hover:bg-pink-500"
        >
          {visSkjema ? "Skjul skjema" : "Legg til ny reise"}
        </button>
      </div>

      {/* SKJEMA FOR Å REGISTRERE REISE */}
      {visSkjema && (
        <div className="p-6 bg-transparent border rounded-lg border-contrast">
          <TravelForm />
        </div>
      )}
    </div>
  );
}
