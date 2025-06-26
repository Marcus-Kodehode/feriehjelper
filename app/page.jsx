import TravelSummary from "@/components/dashboard/TravelSummary";

export default function Home() {
  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h1 className="mb-4 text-2xl font-bold text-primary">Mitt Dashbord</h1>
      <TravelSummary />
    </div>
  );
}
