/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'brownmain': {
          '50': '#f8f8f6',
          '100': '#f2f0ee',
          '200': '#dedad4',
          '300': '#c9c4ba',
          '400': '#a19786',
          '500': '#796b52',
          '600': '#6d604a',
          '700': '#5b503e',
          '800': '#494031',
          '900': '#3b3428'
        }
      }
    },
  },
  plugins: [],
};
