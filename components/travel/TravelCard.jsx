export default function TravelCard({ trip }) {
  return (
    <div className="p-4 bg-white border rounded shadow">
      <h3 className="text-lg font-bold">{trip.title}</h3>
      <p>{trip.destination}</p>
      <p>{trip.from} - {trip.to}</p>
      <p className="text-sm text-gray-600">{trip.notes}</p>
    </div>
  );
}
