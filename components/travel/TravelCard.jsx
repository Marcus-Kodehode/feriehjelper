export default function TravelCard({ trip, isNextTrip = false }) {
  const startDate = new Date(trip.from);
  const endDate = new Date(trip.to);
  const today = new Date();

  const duration =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const daysUntil =
    Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-[#1f1f1f] text-footerText p-4 rounded-lg shadow-lg mb-4 border border-contrast flex justify-between items-start">
      {/* VENSTRE SIDE */}
      <div>
        <h2 className="text-lg font-semibold text-primary">{trip.title}</h2>
        <p className="text-sm text-gray-300">{trip.destination}</p>
        <p className="text-sm text-gray-400">
          {trip.from} – {trip.to}
        </p>
        <p className="mt-1 text-xs italic text-gray-500">{trip.travelers ?? 2} reisende</p>
        <p className="mt-1 text-xs text-contrast">Varighet: {duration} dager</p>
        {trip.notes && (
          <p className="mt-2 text-sm italic text-gray-500">{trip.notes}</p>
        )}
      </div>

      {/* HØYRE SIDE */}
      <div className="space-y-2 text-right">
        {isNextTrip && (
          <span className="inline-block px-2 py-1 text-xs font-bold text-black rounded-full bg-contrast">
            Neste reise
          </span>
        )}
        {daysUntil >= 0 && (
          <p className="text-sm font-semibold text-accent">
            {daysUntil} dager igjen
          </p>
        )}
      </div>
    </div>
  );
}
