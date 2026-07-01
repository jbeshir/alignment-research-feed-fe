import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        "brand-bg": "#E8E4DC",
        "brand-bg-dark": "#1a1a1a",
        "brand-dark": "#2D2D2D",
        "brand-light": "#f5f5f5",
        accent: "#0f766e",
        "accent-hover": "#0d9488",
        "accent-light": "#ccfbf1",
        "accent-dark": "#0f766e",
        "accent-dark-hover": "#115e59",
        "accent-dark-fg": "#14b8a6",
        "accent-dark-fg-hover": "#2dd4bf",
        // Dark-mode elevation surface steps (P13). Light mode uses stone-* utilities directly.
        // Tokenized so a later PR (P15) can re-base the dark hue without touching components.
        "surface-1": "#1e293b", // dark card resting (slate-800)
        "surface-2": "#334155", // dark raised / hover / detail-header / analysis-panel (slate-700)
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(87,83,78,0.16), 0 1px 2px -1px rgba(68,64,60,0.10)",
        "card-hover":
          "0 8px 12px -3px rgba(87,83,78,0.22), 0 4px 6px -2px rgba(68,64,60,0.14)",
        panel:
          "0 3px 6px -1px rgba(87,83,78,0.18), 0 2px 4px -1px rgba(68,64,60,0.12)",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      animation: {
        "progress-bar": "progress-bar 1.5s ease-in-out infinite",
      },
      keyframes: {
        "progress-bar": {
          "0%": { transform: "translateX(-100%)", width: "30%" },
          "50%": { transform: "translateX(100%)", width: "60%" },
          "100%": { transform: "translateX(300%)", width: "30%" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
