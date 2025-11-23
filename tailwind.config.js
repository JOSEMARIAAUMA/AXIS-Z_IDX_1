
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors based on the screenshot's aesthetic
        'brand-primary': '#34d399',      // A bright green for primary actions/highlights
        'brand-text-primary': '#e5e7eb',  // Off-white for primary text
        'brand-text-secondary': '#9ca3af',// Lighter gray for secondary text
        'brand-surface': '#1f2937',       // Dark blue-gray for main panels
        'brand-surface-light': '#374151', // Slightly lighter gray for hover states or secondary panels
        'brand-bg-dark': '#111827',        // Very dark blue-gray for the main background
        'brand-border': '#374151',       // A border color that matches the light surface
      }
    },
  },
  plugins: [],
}
