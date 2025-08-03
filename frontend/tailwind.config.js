/** @type {import('tailwindcss').Config} */

const customColors = {
  'sky-blue': '#8ecae6',
  'teal': '#219ebc',
  'dark-teal': '#126782',
  'dark-blue': '#023047',
  'my-yellow': '#ffb703',
  'light-orange': '#fd9e02',
}

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",  // scans all your components
  ],
  theme: {
    extend: {
      colors: customColors
    },
  },
  plugins: [],
}