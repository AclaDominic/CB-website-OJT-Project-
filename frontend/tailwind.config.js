/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        company: {
          blue: "#5fa5f9",
          green: "#84cc16",
          dark: "#1e293b",
          light: "#f0f9ff",
          "gradient-start": "#e0f2fe",
          "gradient-end": "#dcfce7",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        zoomInOut: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
      },
      animation: {
        "zoom-in-out": "zoomInOut 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
