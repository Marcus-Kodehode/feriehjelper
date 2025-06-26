/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base palette
        orange: "#FFB347",
        pink: "#F67280",
        beige: "#FAF3E0",
        dark: "#2C2C2C",
        teal: "#3E8E7E",

        // Named roles
        background: "#FAF3E0",
        textDark: "#2C2C2C",
        contrast: "#3E8E7E",
        primary: "#FFB347",
        accent: "#F67280",

        // Component specific
        header: "#FFB347",
        footer: "#2C2C2C",
        footerText: "#EDEDED",
      },
    },
  },
  plugins: [],
};
