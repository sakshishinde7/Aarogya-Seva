/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF8F4',
        sage: '#A8C3A0',
        mint: '#DCEBE0',
        lavender: '#E8E1F4',
        blush: '#F5E2E1',
        blue: '#DFEAF5',
        primary: '#26352F',
        secondary: '#718078',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
