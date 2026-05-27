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
        primary: {
          DEFAULT: "#6C5CE7",
          50: "#F0EFFD",
          100: "#E0DFFB",
          200: "#C2C0F7",
          300: "#A39EF3",
          400: "#857FEF",
          500: "#6C5CE7",
          600: "#5638D8",
          700: "#452AB8",
          800: "#372098",
          900: "#2C1978",
        },
        secondary: {
          DEFAULT: "#00CEC9",
          50: "#E0FCFB",
          100: "#B3F8F5",
          200: "#80F2EE",
          300: "#4DECE7",
          400: "#1AE5DF",
          500: "#00CEC9",
          600: "#00A8A4",
          700: "#00827F",
          800: "#005C5A",
          900: "#003635",
        },
        surface: {
          DEFAULT: "#F8F9FA",
          dark: "#1E293B",
        },
        text: {
          dark: "#2D3436",
          light: "#95A5A6",
        },
      },
      fontFamily: {
        arabic: ["var(--font-arabic)", "Tajawal", "Tahoma", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.1)",
        "card-dark": "0 2px 12px rgba(0,0,0,0.2)",
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
