import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kabut: "#E6ECEE",
        lembar: "#F8FAFA",
        "celup-indigo": "#26325B",
        tinta: "#151A24",
        kapur: "#E8E36B",
        "benang-abu": "#9AA5AE",
        garis: "#C9D2D7",
        "teks-sekunder": "#4B5563",
        // Status Colors (makna tetap)
        "status-lolos": "#1F7A4D",
        "status-perbaikan": "#A86A00",
        "status-cacat": "#B3261E",
        "status-info": "#2F5FA8",
        // Client Thread Colors
        "thread-snohund": "#5FA0C8",
        "thread-klien1": "#7A5BB0",
        "thread-klien2": "#BE3F7C",
        "thread-klien3": "#8A5A3B",
        "thread-klien4": "#1F8A93",
        "thread-klien5": "#6E7480",
      },
      fontFamily: {
        sans: ["Archivo", "Arial Narrow", "system-ui", "sans-serif"],
      },
      boxShadow: {
        hard: "0 2px 0 #C9D2D7",
        "hard-indigo": "0 2px 0 #26325B",
        "hard-deep": "0 4px 0 #C9D2D7",
      },
      borderRadius: {
        work: "6px",
        field: "3px",
        terminal: "12px",
      },
      transitionDuration: {
        fast: "120ms",
        base: "220ms",
        slow: "420ms",
      },
      transitionTimingFunction: {
        stitch: "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
