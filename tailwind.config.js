/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // Ensures Material UI components and existing SCSS styles remain intact
  },
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#1e90ff',
          600: '#0070e0',
          700: '#0058b8',
        },
      },
    },
  },
  plugins: [],
}
