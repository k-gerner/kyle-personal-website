/** @type {import('tailwindcss').Config} */

const customColors = {
  'sky-blue': '#8ecae6',
  'teal': '#219ebc',
  'dark-teal': '#126782',
  'dark-blue': '#023047',
  'my-yellow': '#ffb703',
  'light-orange': '#fd9e02',

  'primary-accent': 'var(--primary-accent-color)',
  'primary-base': 'var(--primary-base-color)',
  'primary-highlight': 'var(--primary-highlight-color)',
  'primary-contrast': 'var(--primary-contrast-color)',
  'secondary-accent': 'var(--secondary-accent-color)',
  'secondary-base': 'var(--secondary-base-color)',
  'secondary-contrast': 'var(--secondary-contrast-color)',
  'background-base': 'var(--background-base-color)',
  'background-muted': 'var(--background-muted-color)',
  'background-contrast': 'var(--background-contrast-color)',
  'text-base': "rgb(var(--text-base-color), <alpha-value>)",
  'text-muted': 'var(--text-muted-color)',
  'text-contrast': 'var(--text-contrast-color)',
  'danger': 'var(--danger-color)',
  'success': 'var(--success-color)',

  // game specific
  'connect-4-board': 'var(--connect-4-board-color)',
  'connect-4-board-highlight': 'var(--connect-4-board-highlight-color)',
  'connect-4-piece-red': 'var(--connect-4-piece-red-color)',
  'connect-4-piece-yellow': 'var(--connect-4-piece-yellow-color)',

  'gomoku-board': 'var(--gomoku-board-color)',
  'gomoku-piece-black': 'var(--gomoku-piece-black-color)',
  'gomoku-piece-white': 'var(--gomoku-piece-white-color)',
}

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",  // scans all your components
  ],
  theme: {
    extend: {
      colors: customColors,
      transitionProperty: {
        'height': 'height'
      },
      keyframes: {
        dropdown: {
          '0%': { opacity: '0', transform: 'scaleY(0.95)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' },
        },
        pop: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        slideInFromTop: {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        revealFromTop: {
          '0%': { clipPath: 'inset(0 0 100% 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        revealFromTop2: {
          // CSS needs a defined value for height in order to animate,
          // so as a workaround, we animate maxHeight instead. A larger 
          // value will make the animation faster
          '0%': { maxHeight: '0' },
          '100%': { maxHeight: '500px' },
        },
        enlargeBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.10)' },
          '100%': { transform: 'scale(1)' },
        }
        // expandVertically: {
        //   '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
        //   '100%': { transform: 'scaleY(1)%', transformOrigin: 'top' },
        // },
      },
      animation: {
        dropdown: 'dropdown 0.1s ease-out',
        pop: 'pop 0.3s ease forwards',
        slideInFromTop: 'slideInFromTop 0.3s ease-out forwards',
        revealFromTop: 'revealFromTop2 0.5s ease-out forwards',
        enlargeBounce: 'enlargeBounce 1.0s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}