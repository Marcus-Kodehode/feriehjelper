import "../styles/globals.css";
import { TravelProvider } from "../components/context/TravelContext";
import { BudgetProvider } from "../components/context/BudgetContext";

import { EmergencyProvider } from "../components/context/EmergencyContext";
import Layout from "../components/layout/Layout";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";
import { ActivityProvider } from "../components/context/ActivityContext";

export const metadata = {
  title: "VacationHelper",
  description: "Plan your perfect vacation",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <TravelProvider>
            <BudgetProvider>
              <EmergencyProvider>
                <ActivityProvider>
                  <Layout>
                    {children}
                    <Analytics />
                    <SpeedInsights />
                  </Layout>
                </ActivityProvider>
              </EmergencyProvider>
            </BudgetProvider>
          </TravelProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
// RootLayout definerer den overordnede strukturen for hele applikasjonen.
// Den inkluderer globale CSS-stiler og pakker inn appen i flere "Context Providers"
// for å gi tilgang til data som reiser, budsjett, aktiviteter og nødinformasjon.
// Layout-komponenten brukes som ramme rundt alt innhold (children).
// Denne filen brukes som rot-layout i Next.js og gjelder hele appen.
