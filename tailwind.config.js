/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    borderRadius: {
      none: '0px',
      sm: '4px',
      DEFAULT: '6px',
      md: '6px',
      lg: '10px',
      xl: '14px',
      '2xl': '18px',
      '3xl': '24px',
      full: '9999px',
    },
    extend: {
      fontFamily: {
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Dark Cinematic Palette
        cinema: {
          bg: '#0B0C16',
          'bg-subtle': '#111222',
          surface: '#17182B',
          'surface-elevated': '#1F213A',
          'surface-hover': '#282B4A',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-highlight': 'rgba(234, 179, 8, 0.3)',
          gold: '#EAB308',
          'gold-light': '#FDE047',
          'gold-dark': '#CA8A04',
          rose: '#F43F5E',
          text: '#F8FAFC',
          'text-muted': '#94A3B8',
          'text-dim': '#64748B',
        },
        // Legacy Brand alias mapping for seamless compatibility
        brand: {
          50: '#17182B',
          100: '#1F213A',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          dark: '#F8FAFC',
          border: 'rgba(255, 255, 255, 0.1)',
          bg: '#0B0C16',
          'bg-light': '#17182B',
          text: '#CBD5E1',
          'text-muted': '#94A3B8',
          error: '#EF4444',
          seat: {
            available: '#2A2D48',
            selected: '#EAB308',
            held: '#475569',
            sold: '#1E2032',
            vip: '#8B5CF6',
            couple: '#EC4899',
          }
        },
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(234, 179, 8, 0.4)',
        'glow-gold-sm': '0 0 12px -2px rgba(234, 179, 8, 0.35)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'cinematic': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'cinema-radial': 'radial-gradient(ellipse at top, #1A1C36 0%, #0B0C16 70%)',
        'gold-gradient': 'linear-gradient(135deg, #FDE047 0%, #EAB308 50%, #CA8A04 100%)',
        'dark-glass': 'linear-gradient(180deg, rgba(27, 29, 49, 0.7) 0%, rgba(17, 18, 34, 0.85) 100%)',
      }
    },
  },
  plugins: [],
}

