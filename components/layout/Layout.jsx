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
