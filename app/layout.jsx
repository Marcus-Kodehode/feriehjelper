import "@/styles/globals.css";
import { TravelProvider } from "@/components/context/TravelContext";
import { BudgetProvider } from "@/components/context/BudgetContext";
import Layout from "@/components/layout/Layout";

export const metadata = {
  title: "VacationHelper",
};

export default function RootLayout({ children }) {
  return (
    <html lang="no">
      <body className="bg-[#121212] text-white">
        <TravelProvider>
          <BudgetProvider>
            <Layout>{children}</Layout>
          </BudgetProvider>
        </TravelProvider>
      </body>
    </html>
  );
}
