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
        cream: "#FDFCF8",
        sage: "#A3B18A",
        accent: "#D4A373"
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["Pretendard", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        card: "0 20px 45px -25px rgba(82, 101, 84, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
