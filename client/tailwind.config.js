/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          dark: '#111111',      // Pure dark elegance
          light: '#FBFBF9',     // Premium Off-white background
          cream: '#F5EFEB',     // Soft Cream accent
          gold: '#C5A880',      // Soft bronze/gold branding accent
          goldDark: '#A68B63',  // Dark gold for hover and text
          gray: '#E6E6E3',      // Soft neutral border gray
          textGray: '#666666',  // Readable secondary body text
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}
