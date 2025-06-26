/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFB347",        // Orange
        accent: "#F67280",         // Rosa
        background: "#1A1A1A",     // Bakgrunn mørk
        header: "#2A2A35",         // Header mørkeblå-ish
        footer: "#111111",         // Footer sort
        footerText: "#FAF3E0",     // Lys tekst
        textDark: "#2C2C2C",
        contrast: "#3E8E7E",       // Grønnblå
        danger: "#D7263D",         // Rød
        dark: "#1E1E1E",
      },
    },
  },
  plugins: [],
};
