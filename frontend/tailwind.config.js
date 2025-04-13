/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        proxima: ["ProximaNova-Regular", "ProximaNova-Bold"],
      },
    },
  },
  plugins: [],
};
