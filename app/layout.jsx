import "@/styles/globals.css";
import { TravelProvider } from "@/components/context/TravelContext";
import { BudgetProvider } from "@/components/context/BudgetContext";
import { ActivityProvider } from "@/components/context/ActivityContext"; // 👈 denne må inn
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
            <ActivityProvider> {/* 👈 pakket rundt Layout */}
              <Layout>{children}</Layout>
            </ActivityProvider>
          </BudgetProvider>
        </TravelProvider>
      </body>
    </html>
  );
}
