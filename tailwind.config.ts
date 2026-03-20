import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          500: '#4f7cff',
          600: '#3f68df',
        },
      },
      boxShadow: {
        card: '0 20px 45px -25px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
