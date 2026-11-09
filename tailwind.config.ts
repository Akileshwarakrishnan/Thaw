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
        casper: {
          bg: "#F0F5F7",
          card: "#FFFFFF",
          navy: "#1c346c",
          ice: "#84bbe3",
          slate: "#64759d",
          frost: "#a2b4cc",
          border: "#E4E6EE",
          alert: "#cc352c",
          text: "#0c0c14",
          muted: "#526699",
        },
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfd",
          300: "#84bbe3", // Casper ice accent
          400: "#36a1f7",
          500: "#1c346c", // Casper trust navy anchor
          600: "#162854",
          700: "#101d3d",
          800: "#0b1328",
          900: "#060914",
        },
      },
      boxShadow: {
        "casper-sm": "0 2px 8px rgb(30 48 110 / 0.06)",
        "casper-md": "0 5px 30px rgb(30 48 110 / 0.08)",
        "casper-block": "0px 18px 50px rgb(30 48 110 / 0.10)",
      },
      borderRadius: {
        "casper-card": "16px",
        "casper-lg": "24px",
      },
    },
  },
  plugins: [],
};
export default config;
