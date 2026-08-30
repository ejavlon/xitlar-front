import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        music: {
          header: "#365377",
          headerDark: "#2d4665",
          accent: "#f59e0b",
          accentHover: "#d97706",
          bg: "#edf0f5",
          card: "#ffffff",
          textDark: "#1e293b",
          textMuted: "#64748b",
          border: "#e2e8f0",
          tagBg: "#f1f5f9",
          tagHover: "#e2e8f0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
