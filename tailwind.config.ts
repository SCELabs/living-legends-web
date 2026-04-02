import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f1115",
        panel: "#161a22",
        border: "#252a36",
        text: "#e6e9ef",
        muted: "#9aa3b2",
        accent: "#7c9cff",

        state: {
          stable: "#4ade80",     // green
          unstable: "#facc15",   // yellow
          conflict: "#fb923c",   // orange
          critical: "#ef4444",   // red
        },
      },
      borderRadius: {
        xl: "14px",
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.04), 0 10px 30px rgba(0,0,0,0.4)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
