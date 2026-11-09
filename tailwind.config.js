/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "Arial", "sans-serif"],
        display: ["var(--font-chakra)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Surfaces from the page background (ink) up to raised panels and wells.
        ink: "#0E0F12",
        panel: "#15171B",
        raised: "#1C1F24",
        well: "#262A30",
        line: { DEFAULT: "#2B3037", strong: "#3B424B" },
        // Logo cyan. `accent` is kept as an alias so older classes still resolve.
        brand: { DEFAULT: "#4AC0DE", soft: "#8AD8EC", deep: "#1E7F99", ink: "#04222B" },
        accent: { DEFAULT: "#4AC0DE", deep: "#1E7F99" },
        pop: "#F5B84B",
        win: "#3DD6A0",
        loss: "#FF6B7A",
        warn: "#F5B84B",
        // Neutral greys. The logo cyan is an accent, not a surface. 100 = main text, 400 = secondary, 500 = muted (AA on panel).
        zinc: {
          50: "#F5F5F6", 100: "#E8E8E8", 200: "#D5D8DC", 300: "#BCC1C7", 400: "#A6ADB5",
          500: "#8C949D", 600: "#5F666E", 700: "#3B424B", 800: "#2B3037", 900: "#1C1F24", 950: "#0E0F12",
        },
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset",
        glow: "0 0 0 1px rgba(74,192,222,0.35)",
      },
      keyframes: {
        rise: { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "none" } },
      },
      animation: { rise: "rise .35s ease-out both" },
    },
  },
  plugins: [],
};
