/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {

      colors: {
        blue: {
          700: "#003399", // Azul rey
          800: "#00287a",
        },
      },
    },
  },
  plugins: [],
}

