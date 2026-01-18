/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Ensure you have Inter or a similar clean font
      },
      colors: {
        finex: {
          dark: '#0B1019',      // Main Page Background (Deepest Dark)
          card: '#151C2C',      // Card/Sidebar Background
          green: '#00D09C',     // Primary Accent (The Mint Green from screenshots)
          greenGlow: 'rgba(0, 208, 156, 0.15)',
          orange: '#FFB020',    // Secondary Accent (Expenses)
          purple: '#7B61FF',    // Tertiary (Investments/Categories)
          text: '#F1F5F9',      // Primary Text
          muted: '#64748B',     // Secondary Text
        }
      },
      backgroundImage: {
        'green-gradient': 'linear-gradient(135deg, #00D09C 0%, #00b386 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(21, 28, 44, 0.8) 0%, #151C2C 100%)',
      },
      animation: {
        'text-shine': 'text-shine 3s linear infinite',
      },
      keyframes: {
        'text-shine': {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        }
      }
    },
  },
  plugins: [],
}