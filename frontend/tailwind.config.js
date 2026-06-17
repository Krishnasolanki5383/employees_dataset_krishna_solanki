/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3B82F6',
          bg: '#111827',
          card: '#1F2937',
          text: '#F9FAFB',
          textMuted: '#9CA3AF',
          accent: '#10B981', // green accent
          danger: '#EF4444',
          warning: '#F59E0B',
        }
      }
    },
  },
  plugins: [],
}
