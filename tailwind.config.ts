import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d8edff",
          500: "#2375d6",
          600: "#1b5fb5",
          700: "#174d93"
        }
      }
    }
  },
  plugins: []
};

export default config;
