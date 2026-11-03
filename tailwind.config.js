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
        sans: ["var(--font-chakra)", "Inter", "Arial", "Helvetica", "sans-serif"],
      },
      colors: {
        // Surfaces, from the page background up to raised panels.
        ink: "#09090b",
        panel: "#111116",
        raised: "#17171f",
        brand: { DEFAULT: "#22d3ee", soft: "#67e8f9", deep: "#0e7490" },
        accent: { DEFAULT: "#a78bfa", deep: "#6d28d9" },
        win: "#34d399",
        loss: "#fb7185",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(34,211,238,0.35), 0 0 24px -4px rgba(34,211,238,0.35)",
      },
      keyframes: {
        rise: { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "none" } },
      },
      animation: { rise: "rise .35s ease-out both" },
    },
  },
  plugins: [],
};
