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
        ink: "#0A1118",
        panel: "#0F1A24",
        raised: "#15232F",
        well: "#1D2F3E",
        line: { DEFAULT: "#243847", strong: "#2F4A5C" },
        // Logo cyan. `accent` is kept as an alias so older classes still resolve.
        brand: { DEFAULT: "#4AC0DE", soft: "#8AD8EC", deep: "#1E7F99", ink: "#04222B" },
        accent: { DEFAULT: "#4AC0DE", deep: "#1E7F99" },
        win: "#3DD6A0",
        loss: "#FF6B7A",
        warn: "#F5B84B",
        // Neutrals tinted towards the background blue. 100 = main text, 400 = secondary, 500 = muted (AA on panel).
        zinc: {
          50: "#F4F6F8", 100: "#E8E8E8", 200: "#D3DBE1", 300: "#BAC7D0", 400: "#A3B5C2",
          500: "#8A9FAE", 600: "#5D7384", 700: "#2F4A5C", 800: "#243847", 900: "#15232F", 950: "#0A1118",
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
