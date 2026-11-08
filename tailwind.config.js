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
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
      },
      animation: {
        scaleIn: 'scaleIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
