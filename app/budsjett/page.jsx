"use client";
import { useBudget } from "../components/context/BudgetContext"; 
import { useLanguage } from "../../components/context/LanguageContext";
import translations from "../../components/lang/translations";
import BudgetForm from "../../components/budget/BudgetForm"; 
import BudgetCard from "../../components/budget/BudgetCard";

export default function BudsjettPage() {
  const { budgets } = useBudget();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h1 className="mb-4 text-2xl font-bold text-primary">{t.myBudget}</h1>

      {/* Vis budsjetter først */}
      <div className="mb-8">
        {budgets.length === 0 ? (
          <p className="text-gray-400">{t.noBudgets}</p>
        ) : (
          budgets.map((budget) => <BudgetCard key={budget.id} budget={budget} />)
        )}
      </div>

      {/* Så skjemaet */}
      <BudgetForm />
    </div>
  );
}
// BudsjettPage viser en oversikt over alle budsjetter knyttet til brukerens reiser.
// Den henter data fra BudgetContext og bruker LanguageContext for oversettelser.
// Hvis det ikke finnes noen budsjetter, vises en melding – ellers vises én BudgetCard per budsjett.
// Nederst vises alltid BudgetForm, som lar brukeren registrere et nytt budsjett.
// Layouten er sentrert og responsiv, med styling via Tailwind CSS.
