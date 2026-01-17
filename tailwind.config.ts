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
    },
  },
  plugins: [],
} satisfies Config;
