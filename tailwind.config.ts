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
          DEFAULT: "#6B4EE6",
          50: "#F0EDFF",
          100: "#DDD6FE",
          200: "#C4B5FD",
          300: "#A78BFA",
          400: "#8B7EF5",
          500: "#6B4EE6",
          600: "#5A3FD4",
          700: "#4C34B8",
          800: "#3E2A9C",
          900: "#2E1F7A",
        },
        secondary: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        accent: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
        },
        surface: "#F5F7FA",
        "surface-dark": "#0F172A",
        muted: "#94A3B8",
      },
      fontFamily: {
        arabic: ["var(--font-arabic)", "Tajawal", "Tahoma", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        card: "0 4px 20px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.02)",
        elevated: "0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.03)",
        "card-dark": "0 4px 20px rgba(0,0,0,0.2)",
        button: "0 2px 12px rgba(107,78,230,0.3)",
        "button-warm": "0 2px 12px rgba(245,158,11,0.3)",
        "fab": "0 8px 32px rgba(107,78,230,0.35), 0 2px 8px rgba(107,78,230,0.2)",
      },
      height: {
        screen: "100dvh",
      },
      minHeight: {
        screen: "100dvh",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 8px rgba(107,78,230,0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(107,78,230,0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
