/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'Segoe UI', 'sans-serif'],
        body: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fff6ec',
          100: '#fde6cb',
          500: '#c77b2a',
          600: '#a9651f',
          700: '#874f18',
        },
      },
      backgroundColor: {
        'white-90': 'rgba(255, 255, 255, 0.9)',
      },
    },
  },
  plugins: [],
}

