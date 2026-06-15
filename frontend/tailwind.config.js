import forms from '@tailwindcss/forms'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        azul: {
          escuro: '#1E3A5F',
          medio:  '#2E5F8A',
          claro:  '#D6E4F0',
          btn:    '#1A56A0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: [forms]
}
