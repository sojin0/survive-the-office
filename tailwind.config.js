/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sunny: {
          primary: 'var(--color-sunny-primary)',
          bg: 'var(--color-sunny-bg)',
        },
        cloudy: {
          primary: 'var(--color-cloudy-primary)',
          bg: 'var(--color-cloudy-bg)',
        },
        rain: {
          primary: 'var(--color-rain-primary)',
          bg: 'var(--color-rain-bg)',
        },
        storm: {
          primary: 'var(--color-storm-primary)',
          bg: 'var(--color-storm-bg)',
        },
        hp: {
          high: 'var(--color-hp-high)',
          mid: 'var(--color-hp-mid)',
          low: 'var(--color-hp-low)',
        },
        positive: 'var(--color-positive)',
        negative: 'var(--color-negative)',
      },
      fontFamily: {
        sans: ['Pretendard', 'Apple SD Gothic Neo', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
      },
    },
  },
  plugins: [],
}
