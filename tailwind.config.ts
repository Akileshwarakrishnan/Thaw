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
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Geist", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Arial", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Geist Mono", "monospace"],
      },
      colors: {
        statsig: {
          blue: "#367eed",
          darkBlue: "#1b63d2",
          lightBlue: "#e5f0ff",
          mediumBlue: "#accfff",
          ink: "#0b3679",
          black: "#1f2328",
          darkGray: "#343941",
          secondary: "#535963",
          gray: "#d4d7dc",
          softWhite: "#ededed",
          bg: "#f6f6f6",
        },
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfd",
          300: "#7bacf4",
          400: "#367eed",
          500: "#1b63d2",
          600: "#0b3679",
          700: "#1f2328",
          800: "#15181c",
          900: "#0c0e10",
        },
      },
      boxShadow: {
        "statsig-regular": "0 0 20px rgba(27, 37, 40, 0.05)",
        "statsig-hover": "0 10px 30px rgba(27, 37, 40, 0.09)",
        "statsig-card": "0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        "statsig-card": "10px",
        "statsig-pill": "30px",
      },
    },
  },
  plugins: [],
};
export default config;
