import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modules/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        "4.5": "1.125rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      colors: {
        /* Premium palette: Midnight text, Indigo actions */
        midnight: "#0f172a",
        midnightMuted: "#1e293b",
        indigo: {
          DEFAULT: "#4f46e5",
          hover: "#4338ca",
          light: "#818cf8",
          muted: "rgba(79, 70, 229, 0.12)",
        },
        slate: {
          bg: "#f8fafc",
          surface: "#f1f5f9",
          border: "#e2e8f0",
          muted: "#94a3b8",
        },
        /* Dashboard/dark areas */
        surfaceElevated: "#18181b",
        surfaceOverlay: "#1f1f23",
        border: "rgba(255,255,255,0.06)",
        borderHover: "rgba(255,255,255,0.12)",
        charcoal: "#111113",
        gold: "#C6A95D",
        goldHover: "#B89B50",
        goldMuted: "rgba(198, 169, 93, 0.15)",
        goldSubtle: "rgba(198, 169, 93, 0.08)",
        muted: "#71717a",
        mutedForeground: "#a1a1aa",
        /* Primary action: Indigo / Violet */
        primary: "#4F46E5",
        primaryHover: "#4338CA",
        accent: "#7C3AED",
        accentHover: "#6D28D9",
        background: "#f8fafc",
        surface: "#f8fafc",
        textPrimary: "#0f172a",
        textSecondary: "#64748B",
        marketing: {
          bg: "#f8fafc",
          surface: "#f1f5f9",
          border: "#e2e8f0",
          text: "#0f172a",
          textSecondary: "#64748b",
          textMuted: "#94a3b8",
        },
        saas: {
          bg: "#f8fafc",
          surface: "#f1f5f9",
          primary: "#4F46E5",
          primaryHover: "#4338CA",
          accent: "#7C3AED",
          accentHover: "#6D28D9",
          border: "#e2e8f0",
          textPrimary: "#0f172a",
          textSecondary: "#64748b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["2.75rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "display-md": ["2rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        "display-sm": ["1.5rem", { lineHeight: "1.3" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "label": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.05em" }],
      },
      boxShadow: {
        /* Consistent design-system shadows (Shopify-style) */
        "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "md": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "gold-glow": "0 0 25px rgba(198, 169, 93, 0.45)",
        "glass": "0 4px 24px -1px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
        "panel": "0 4px 6px -1px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)",
        "elevated": "0 12px 40px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        "marketing-card": "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "marketing-card-hover": "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)",
        "ds-card": "0 1px 3px 0 rgb(0 0 0 / 0.06)",
        "ds-card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.08)",
        "saas-card": "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "saas-card-hover": "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)",
      },
      borderRadius: {
        /* Consistent rounded corners — dashboard & forms */
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
