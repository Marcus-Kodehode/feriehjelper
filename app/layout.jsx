import "@/styles/globals.css";
import { TravelProvider } from "@/components/context/TravelContext";
import { BudgetProvider } from "@/components/context/BudgetContext";
import { ActivityProvider } from "@/components/context/ActivityContext";
import { EmergencyProvider } from "@/components/context/EmergencyContext";
import Layout from "@/components/layout/Layout";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from '@vercel/speed-insights/next';


export const metadata = {
  title: "VacationHelper",
};

export default function RootLayout({ children }) {
  return (
    <html lang="no">
      <body className="bg-[#121212] text-white">
        <TravelProvider>
          <BudgetProvider>
            <ActivityProvider>
              <EmergencyProvider>
                <Layout>{children}</Layout>
              </EmergencyProvider>
            </ActivityProvider>
          </BudgetProvider>
        </TravelProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
// RootLayout definerer den overordnede strukturen for hele applikasjonen.
// Den inkluderer globale CSS-stiler og pakker inn appen i flere "Context Providers"
// for å gi tilgang til data som reiser, budsjett, aktiviteter og nødinformasjon.
// Layout-komponenten brukes som ramme rundt alt innhold (children).
// Denne filen brukes som rot-layout i Next.js og gjelder hele appen.
