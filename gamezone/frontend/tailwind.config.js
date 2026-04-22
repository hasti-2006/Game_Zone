/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#04594A',
        accent: '#BF9227',
        background: '#F5F7F6',
        card: '#FFFFFF',
        border: '#E5E7EB',
        textMain: '#111827',
        textMuted: '#6B7280',
      },
    },
  },
  plugins: [],
}
