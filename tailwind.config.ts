import type { Config } from "tailwindcss";
import formsPlugin from "@tailwindcss/forms";

const colors = require('tailwindcss/colors');

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    extend: {
      colors: {
        orange: colors.orange,
      },
    },
  },
  plugins: [
    formsPlugin,
  ],
  darkMode: 'selector',
} satisfies Config;
