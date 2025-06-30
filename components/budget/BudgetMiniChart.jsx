'use client';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetMiniChart({ budget }) {
  const data = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#facc15', '#f87171', '#34d399', '#60a5fa', '#a78bfa'],
        borderColor: '#1f1f1f',
        borderWidth: 1,
      },
    ],
  };

  if (budget.transport) {
    data.labels.push('Transport');
    data.datasets[0].data.push(Number(budget.transport));
  }
  if (budget.accommodation) {
    data.labels.push('Overnatting');
    data.datasets[0].data.push(Number(budget.accommodation));
  }
  if (budget.food) {
    data.labels.push('Mat');
    data.datasets[0].data.push(Number(budget.food));
  }
  if (budget.activities) {
    data.labels.push('Aktiviteter');
    data.datasets[0].data.push(Number(budget.activities));
  }
  if (budget.other) {
    data.labels.push('Annet');
    data.datasets[0].data.push(Number(budget.other));
  }

  if (data.datasets[0].data.length === 0) return null;

  return (
    <div className="w-40 mx-auto mt-2">
      <Pie data={data} options={{ plugins: { legend: { display: false } } }} />
    </div>
  );
}
