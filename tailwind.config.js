/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nihao: {
          red: {
            light: "#f5e8e9",
            normal: "#9d1c21",
            hover: "#8d191e",
            active: "#7e161a",
            dark: "#761519",
          },
          yellow: {
            light: "#faf5e8",
            normal: "#ca9a1a",
            hover: "#b68b17",
            active: "#a27b15",
            dark: "#987414",
          },
        },
      },
      fontFamily: {
        sans: [
          "var(--font-app)",
          "Inter",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        times: ["Times New Roman", "Times", "serif"],
        helvetica: ["Helvetica", "Arial", "sans-serif"],
        inter: ["Inter", "Helvetica Neue", "Helvetica", "Arial", "ui-sans-serif", "system-ui", "sans-serif"],
        arabic: ["Alexandria", "sans-serif"],
        cairo: ["Alexandria", "sans-serif"],
      },

    },
  },
  plugins: [],
}