// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust paths as needed
  ],
  theme: {
    extend: {
      colors: {
        'light-blue': '#AAD7D9', // Custom light blue color
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite', // Custom slow spin animation
      },
      keyframes: {
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
