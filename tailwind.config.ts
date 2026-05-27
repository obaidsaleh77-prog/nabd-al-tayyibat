import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        emerald: {
          pulse: {
            from: "#059669",
            to: "#10B981",
          },
        },
        gold: {
          accent: "#F59E0B",
        },
      },
      fontFamily: {
        arabic: ["var(--font-arabic)", "Tahoma", "Arial", "sans-serif"],
      },
      keyframes: {
        "pulse-line": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "pulse-line": "pulse-line 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
