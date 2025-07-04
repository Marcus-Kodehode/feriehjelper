import Header from "./Header";
import Footer from "./Footer";
import { LanguageProvider } from "@/components/context/LanguageContext";

export default function Layout({ children }) {
  return (
    <LanguageProvider>
      <Header />
      <main className="min-h-screen px-4 py-6 bg-background text-footerText">
        {children}
      </main>
      <Footer />
    </LanguageProvider>
  );
}
// Denne Layout-komponenten definerer struktur for sider i appen med felles Header og Footer.
// Innholdet mellom disse pakkes inn i <main>, og alt er omgitt av LanguageProvider
// slik at språkvalg er tilgjengelig for komponenter under.
// Brukes til å gi en enhetlig layout på tvers av forskjellige sider i applikasjonen.
