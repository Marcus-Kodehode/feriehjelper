"use client";
import EmergencyCard from "@/components/emergency/EmergencyCard";
import EmergencyForm from "@/components/emergency/EmergencyForm";

export default function EmergencyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-accent">Nødinformasjon</h1>

      {/* Vis lagrede nødinformasjoner */}
      <EmergencyCard />

      {/* Skjema for å legge til/redigere */}
      <EmergencyForm />
    </div>
  );
}
