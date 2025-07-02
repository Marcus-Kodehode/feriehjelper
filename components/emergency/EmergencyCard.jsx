"use client";
import { useEmergency } from "../context/EmergencyContext";
import { useTravel } from "../context/TravelContext";

export default function EmergencyCard() {
  const { emergencies, deleteEmergency } = useEmergency();
  const { trips } = useTravel();

  if (!emergencies.length)
    return <p className="text-gray-400">Ingen nødinformasjon lagret.</p>;

  return (
    <div className="space-y-4">
      {emergencies.map((e) => {
        const trip = trips.find((t) => t.id.toString() === e.tripId);

        return (
          <div
            key={e.id}
            className="relative p-4 border rounded-lg border-contrast bg-[#1f1f1f]"
          >
            {/* Reiseoverskrift */}
            <h3 className="mb-1 text-lg font-semibold text-primary">
              {trip?.title || "Ukjent reise"}
            </h3>

            {/* Info */}
            {e.embassy && (
              <p className="text-sm text-gray-300">Ambassade: {e.embassy}</p>
            )}
            {e.police && (
              <p className="text-sm text-gray-300">Politi: {e.police}</p>
            )}
            {e.ambulance && (
              <p className="text-sm text-gray-300">Ambulanse: {e.ambulance}</p>
            )}
            {e.fire && (
              <p className="text-sm text-gray-300">Brann: {e.fire}</p>
            )}
            {e.insuranceCompany && (
              <p className="text-sm text-gray-300">
                Forsikring: {e.insuranceCompany}
              </p>
            )}
            {e.policyNumber && (
              <p className="text-sm text-gray-300">
                Polisenummer: {e.policyNumber}
              </p>
            )}
            {e.emergencyContact && (
              <p className="text-sm text-gray-300">
                Kontaktperson: {e.emergencyContact}
              </p>
            )}
            {e.notes && (
              <p className="mt-1 text-sm italic text-gray-400">📝 {e.notes}</p>
            )}

            {/* Rediger / Slett */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => alert("Redigerfunksjon kommer snart!")}
                className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Rediger
              </button>
              <button
                onClick={() => deleteEmergency(e.id)}
                className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
              >
                Slett
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
