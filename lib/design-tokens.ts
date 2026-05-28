/**
 * Design Tokens — نظام التصميم الموحد
 * 8pt Grid System + Figma Design Language
 */

export const spacing = {
  /** 2px */
  xxs: "2px",
  /** 4px — 0.5× base */
  xs: "4px",
  /** 8px — base unit */
  sm: "8px",
  /** 12px — 1.5× */
  md: "12px",
  /** 16px — 2× */
  lg: "16px",
  /** 20px — 2.5× */
  xl: "20px",
  /** 24px — 3× */
  "2xl": "24px",
  /** 32px — 4× */
  "3xl": "32px",
  /** 40px — 5× */
  "4xl": "40px",
  /** 48px — 6× */
  "5xl": "48px",
} as const;

export const borderRadius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  full: "9999px",
} as const;

export const colors = {
  primary: "#6B4EE6",
  secondary: "#10B981",
  accent: "#F59E0B",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  text: "#1A1A2E",
  muted: "#94A3B8",
  border: "#E8ECF0",
} as const;

export const shadows = {
  card: "0 4px 20px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.02)",
  elevated: "0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.03)",
  fab: "0 8px 32px rgba(107,78,230,0.35), 0 2px 8px rgba(107,78,230,0.2)",
} as const;

export const transitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;
