/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        border: 'hsl(var(--border))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        primary: {
          DEFAULT: '#4F9D7E',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#E8D4B8',
          foreground: '#1E1E1E',
        },
        accent: {
          DEFAULT: '#9B9FCE',
          foreground: '#FFFFFF',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        destructive: '#EF4444',
        info: '#3B82F6',
      },
      borderRadius: {
        sm: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        full: '999px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        base: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        brand: ['PlayfairDisplay_600SemiBold'],
      },
    },
  },
  plugins: [],
};
