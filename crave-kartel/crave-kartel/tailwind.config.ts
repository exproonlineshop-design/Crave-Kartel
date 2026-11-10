import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { forest: { 950: "#06241a", 900: "#0a3324", 800: "#0f4330", 700: "#165a40" }, gold: { 300: "#e6cb85", 400: "#d4b062", 500: "#c9a24a" } },
    fontFamily: { display: ["var(--font-display)", "serif"], body: ["var(--font-body)", "system-ui", "sans-serif"] },
  } },
  plugins: [],
};
export default config;
