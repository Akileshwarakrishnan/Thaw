import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfd",
          300: "#7cc1fb",
          400: "#36a1f7",
          500: "#0070ba", // PayPal blue inspired
          600: "#005ea6",
          700: "#004b87",
          800: "#044071",
          900: "#08365e",
        },
        navy: {
          800: "#0f172a",
          900: "#0a0f1d",
          950: "#050811",
        },
      },
    },
  },
  plugins: [],
};
export default config;
