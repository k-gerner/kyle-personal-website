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
}

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",  // scans all your components
  ],
  theme: {
    extend: {
      colors: customColors,
      keyframes: {
        dropdown: {
          '0%': { opacity: '0', transform: 'scaleY(0.95)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' },
        },
      },
      animation: {
        dropdown: 'dropdown 0.1s ease-out',
      },
    },
  },
  plugins: [],
}