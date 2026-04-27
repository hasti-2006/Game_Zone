/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#023859',        /* Deep Navy */
        'primary-dark': '#011C40', /* Darkest Navy */
        accent: '#54ACBF',         /* Medium Teal */
        'accent-dark': '#26658C',  /* Medium Blue */
        'light-aqua': '#A7EBF2',   /* Light Aqua */
        background: '#F3F7FA',     /* Page background */
        card: '#FFFFFF',           /* Card background */
        border: '#D9E4EC',         /* Card border */
        textMain: '#011C40',       /* Main body text */
        textMuted: '#26658C',      /* Subtext, muted labels */
        textHint: '#54ACBF',       /* Placeholder, hints */
      },
    },
  },
  plugins: [],
}
