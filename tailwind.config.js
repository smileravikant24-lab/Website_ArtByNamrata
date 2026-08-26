export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'art-dark': '#121212',
        'art-gold': '#D4AF37',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}