/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './projecten/*.html',
    './assets/js/*.js',
    './tools/partials/*.html',
    './tools/build.mjs',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F4',
        sand: '#F3EFE8',
        sand2: '#E9E2D5',
        ink: '#161412',
        coal: '#110F0D',
        charcoal: '#1D1A17',
        bronze: {
          DEFAULT: '#A9895B',
          light: '#CBB288',
          lighter: '#E4D5BC',
          dark: '#85693D',
          darker: '#5E4826',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
