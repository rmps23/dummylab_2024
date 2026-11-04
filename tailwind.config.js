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
        sans: ["var(--font-body)", "system-ui", "Arial", "sans-serif"],
        display: ["var(--font-chakra)", "system-ui", "sans-serif"],
      },
      colors: {
        // Warm neutral surfaces, from the page background up to raised panels.
        ink: "#0f0f0e",
        panel: "#171716",
        raised: "#1f1f1d",
        brand: { DEFAULT: "#3ab5c6", soft: "#5cc6d4", deep: "#0e7490" },
        // Warm sand: used sparingly (Pro tags, highlights).
        accent: { DEFAULT: "#d6a24e", deep: "#9a6b1c" },
        win: "#5fbf8f",
        loss: "#e0726a",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.35)",
      },
      keyframes: {
        rise: { from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "none" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: { rise: "rise .25s ease-out both", marquee: "marquee 28s linear infinite" },
    },
  },
  plugins: [],
};
