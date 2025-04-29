import tailwindcssAnimate from "tailwindcss-animate";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "bg-black",
    "text-white",
    "bg-primary",
    "bg-secondary",
    // 把你有用 @apply 的所有class都列進來
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: "#0f0f0f",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "border-pulse": "borderPulse 7s ease-in-out infinite",
      },
      keyframes: {
        borderPulse: {
          "0%, 100%": { borderColor: "#D8AE16", borderWidth: "2px" },
          "50%": { borderColor: "#FFD700", borderWidth: "2px" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
