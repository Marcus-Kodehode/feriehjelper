export default function TravelCard({ trip }) {
  return (
    <div className="bg-[#1f1f1f] text-footerText p-4 rounded-lg shadow-lg mb-4 border border-contrast">
      <h2 className="text-lg font-semibold text-primary">{trip.title}</h2>
      <p className="text-sm text-gray-300">{trip.destination}</p>
      <p className="text-sm text-gray-400">{trip.from} – {trip.to}</p>
      {trip.notes && (
        <p className="mt-1 text-sm italic text-gray-400">{trip.notes}</p>
      )}
    </div>
  );
}
