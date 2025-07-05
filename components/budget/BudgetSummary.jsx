"use client";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetSummary({ budget }) {
  const { language } = useLanguage();
  const t = translations[language];

  const data = {
    labels: [],
    datasets: [
      {
        label: t.budget,
        data: [],
        backgroundColor: ['#facc15', '#f87171', '#34d399', '#60a5fa'],
        borderColor: '#1f1f1f',
        borderWidth: 1,
      },
    ],
  };

  if (budget.transport) {
    data.labels.push(t.transport);
    data.datasets[0].data.push(Number(budget.transport));
  }
  if (budget.hotel || budget.accommodation) {
    data.labels.push(t.accommodation);
    data.datasets[0].data.push(Number(budget.hotel || budget.accommodation));
  }
  if (budget.food) {
    data.labels.push(t.food);
    data.datasets[0].data.push(Number(budget.food));
  }
  if (budget.activities) {
    data.labels.push(t.activities);
    data.datasets[0].data.push(Number(budget.activities));
  }

  if (data.datasets[0].data.length === 0) return null;

  return (
    <div className="w-full max-w-xs mx-auto mt-4">
      <Pie data={data} />
    </div>
  );
}
// BudgetSummary viser en større og mer informativ versjon av budsjettfordelingen i et Pie-diagram.
// Den bruker Chart.js og inkluderer samme kategorier som MiniChart, men med en synlig tittel/label.
// Komponentens data hentes fra et `budget`-objekt, og etikettene oversettes via LanguageContext.
// Den støtter både `hotel` og `accommodation` for overnatting, og ignorerer visning hvis ingen data finnes.
// Designet er større og mer sentrert, og brukes typisk i full visning eller redigeringsmodus.
