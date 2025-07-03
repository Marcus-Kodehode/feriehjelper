"use client";
import { useLanguage } from "@/components/context/LanguageContext";
import translations from "@/components/lang/translations";

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="px-6 py-6 mt-12 bg-footer text-footerText">
      <div className="max-w-6xl mx-auto space-y-2 text-sm text-center">
        <p>© {new Date().getFullYear()} Feriehjelper. {t.rightsReserved}</p>
        <p>
          {t.builtWith} <span className="text-primary">Next.js</span> & Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
