/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neo: {
          blue: '#00d4ff',
          purple: '#a855f7',
          pink: '#ff6bcb',
          dark: '#0a0a1a',
          panel: 'rgba(10, 10, 26, 0.85)',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        exo: ['Exo 2', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,212,255,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(0,212,255,0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
