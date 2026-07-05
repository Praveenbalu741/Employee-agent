/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // ─── Organic Constellation Color Palette ────────────────────────────────
      colors: {
        // Base (dark navy/charcoal)
        navy: {
          950: '#070B14',
          900: '#0F1420',
          800: '#151C2E',
          700: '#1E2A42',
          600: '#263350',
          500: '#2F3E62',
        },
        // Warm amber accent
        amber: {
          300: '#FBBF7C',
          400: '#F4A261',
          500: '#E8894A',
          600: '#D06D30',
        },
        // Soft teal accent
        teal: {
          300: '#5EDDD6',
          400: '#2EC4B6',
          500: '#20A89B',
          600: '#147A70',
        },
        // Neutral grays tuned for the dark theme
        slate: {
          100: '#E8ECF4',
          200: '#C8D0E0',
          300: '#A0AABB',
          400: '#70809A',
          500: '#505F78',
          600: '#354260',
        },
        // Semantic
        danger:  '#FF5B5B',
        warning: '#FFB347',
        success: '#4ECDC4',
      },

      // ─── Custom Fonts ──────────────────────────────────────────────────────
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },

      // ─── Extended Spacing / Border Radius ─────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ─── Box shadows for glassmorphism ────────────────────────────────────
      boxShadow: {
        glass:    '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        glow:     '0 0 24px rgba(244,162,97,0.25)',
        'teal-glow': '0 0 24px rgba(46,196,182,0.25)',
        card:     '0 4px 24px rgba(0,0,0,0.3)',
      },

      // ─── Backgrounds ──────────────────────────────────────────────────────
      backgroundImage: {
        'gradient-constellation': 'radial-gradient(ellipse at 20% 50%, rgba(46,196,182,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(244,162,97,0.08) 0%, transparent 60%)',
        'gradient-card':         'linear-gradient(135deg, rgba(30,42,66,0.8) 0%, rgba(21,28,46,0.9) 100%)',
      },

      // ─── Animation ────────────────────────────────────────────────────────
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.3)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'constellation-draw': {
          '0%':   { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'float':              'float 4s ease-in-out infinite',
        'pulse-dot':          'pulse-dot 1.5s ease-in-out infinite',
        'shimmer':            'shimmer 2.5s linear infinite',
        'constellation-draw': 'constellation-draw 3s ease forwards',
      },
    },
  },
  plugins: [],
};
