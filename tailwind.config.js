/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#9af5df',
          300: '#5ce7cb',
          400: '#27ceb1',
          500: '#0ea58e',
          600: '#088675',
          700: '#0a6c5f',
          800: '#0c564d',
          900: '#0e4741',
          950: '#032a26',
        },
        navy: {
          800: '#111e38',
          900: '#0a1128',
          950: '#060a17',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
