import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "selah-sun": "#F8F4B0",
        "selah-night": "#3C3868",
        "selah-star": "#E8E2CC",
        "selah-ink": "#2F2B4A",
        "selah-cloud": "#FDFBEE"
      },
      boxShadow: {
        card: "0 18px 32px -22px rgba(47, 43, 74, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
