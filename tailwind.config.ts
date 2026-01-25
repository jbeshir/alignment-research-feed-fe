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
