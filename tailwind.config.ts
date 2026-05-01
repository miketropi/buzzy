import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
          elevated: "var(--surface-elevated)",
        },
        dash: {
          border: "var(--border)",
          muted: "var(--muted)",
          sidebar: "var(--sidebar)",
        },
        brand: {
          DEFAULT: "#f5db8d",
          hover: "#e0c775",
          ink: "#14110a",
          muted: "rgba(245, 219, 141, 0.14)",
          "muted-strong": "rgba(245, 219, 141, 0.24)",
        },
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};
export default config;
