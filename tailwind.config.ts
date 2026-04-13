import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        // Use DEFAULT so bg-gold, text-gold work, and bg-gold/50 opacity modifier works
        gold: { DEFAULT: "#E8A020", light: "#F5C96A", dark: "#C47E10" },
        // brand-red avoids clobbering Tailwind's built-in red-100…red-900 palette
        "brand-red": { DEFAULT: "#C4380A", light: "#E05030", dark: "#8B2507" },
      },
    },
  },
  plugins: [],
}

export default config
