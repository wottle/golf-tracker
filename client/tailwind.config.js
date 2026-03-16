/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'golf-green': '#2d5016',
        'golf-light': '#7cb342',
        'golf-sand': '#f4e4c1',
        'golf-sky': '#87ceeb',
      },
      fontFamily: {
        'playful': ['Comic Sans MS', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
