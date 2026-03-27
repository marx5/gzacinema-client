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
          // Semantic colors
          dark: '#3b2b19',        // Màu chữ tối
          border: '#ddcbb6',      // Màu viền
          bg: '#fff6ec',          // Màu nền nhạt
          'bg-light': '#eadfce',  // Màu nền rất nhạt
          text: '#7b6446',        // Màu chữ thường
          'text-muted': '#8c7356', // Màu chữ nhạt hơn
          error: '#b0232f',       // Màu lỗi/nguy hiểm
          seat: {
            available: '#ddd',
            selected: '#ff9800',
            held: '#d1d5db',
            sold: '#999',
          }
        },
      },
      backgroundColor: {
        'white-90': 'rgba(255, 255, 255, 0.9)',
      },
    },
  },
  plugins: [],
}

