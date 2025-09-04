"use client";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useLanguage } from "../../components/context/LanguageContext";
import translations from "../../components/lang/translations";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetMiniChart({ budget }) {
  const { language } = useLanguage();
  const t = translations[language];

  const data = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#facc15",
          "#f87171",
          "#34d399",
          "#60a5fa",
          "#a78bfa",
        ],
        borderColor: "#1f1f1f",
        borderWidth: 1,
      },
    ],
  };

  if (budget.transport) {
    data.labels.push(t.transport);
    data.datasets[0].data.push(Number(budget.transport));
  }
  if (budget.accommodation) {
    data.labels.push(t.accommodation);
    data.datasets[0].data.push(Number(budget.accommodation));
  }
  if (budget.food) {
    data.labels.push(t.food);
    data.datasets[0].data.push(Number(budget.food));
  }
  if (budget.activities) {
    data.labels.push(t.activities);
    data.datasets[0].data.push(Number(budget.activities));
  }
  if (budget.other || budget.misc) {
    data.labels.push(t.other);
    data.datasets[0].data.push(Number(budget.other || budget.misc));
  }

  if (data.datasets[0].data.length === 0) return null;

  return (
    <div className="w-40 mx-auto mt-2">
      <Pie
        data={data}
        options={{ plugins: { legend: { display: false } } }}
      />
    </div>
  );
}
// BudgetMiniChart viser et lite kakediagram over fordelingen i et budsjett.
// Den bruker Chart.js (Pie-diagram) og henter språk via LanguageContext for å oversette etiketter.
// Den inkluderer typiske budsjettkategorier: transport, overnatting, mat, aktiviteter og diverse (other/misc).
// Hvis ingen verdier er satt i budsjettet, returnerer komponenten null og vises ikke.
// Diagrammet har et enkelt design uten forklaring (legend), og passer godt inne i kortvisning.
