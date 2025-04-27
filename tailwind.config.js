/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[class="app-dark"]'],
  content: [
    './src/**/*.{html,ts,scss,css}',
    './index.html'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}