"use client";
import ActivityForm from "@/components/activity/ActivityForm";
import { useActivity } from "@/components/context/ActivityContext";

export default function ActivityPage() {
  const { activities } = useActivity();

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-primary">Mine aktiviteter</h1>

      <ActivityForm />

      <div className="mt-8">
        {activities.length === 0 ? (
          <p className="text-gray-300">Ingen aktiviteter enda.</p>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="p-4 mt-4 border rounded bg-zinc-900 border-contrast">
              <h2 className="text-lg font-semibold text-yellow-300">{a.name}</h2>
              <p className="text-sm text-gray-400">{a.date} {a.time && `kl. ${a.time}`}</p>
              {a.place && <p className="text-sm text-gray-300">Sted: {a.place}</p>}
              {a.cost && <p className="text-sm text-gray-300">Kostnad: {a.cost} kr</p>}
              {a.category && <p className="text-sm italic text-gray-400">Kategori: {a.category}</p>}
              {a.notes && <p className="text-sm text-gray-400">📝 {a.notes}</p>}
              {a.link && (
                <a href={a.link} target="_blank" className="text-sm underline text-accent">
                  Mer info
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
