"use client";
import { useLanguage } from "@/components/context/LanguageContext";

export default function LanguageSelect() {
  const { language, setLanguage, available } = useLanguage();

  return (
    <label className="flex items-center gap-2">
      <span className="text-sm">🌐</span>
      <select
        className="px-2 py-1 text-black bg-white border rounded"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {available.map((c) => (
          <option key={c} value={c}>
            {c.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
