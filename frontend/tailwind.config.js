/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        soil: '#7b4f2f',
        leaf: '#2f7d32',
        field: '#f5f9ef',
      },
    },
  },
  plugins: [],
}

