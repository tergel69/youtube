import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        youtube: {
          red: '#FF0000',
          dark: '#0F0F0F',
          darker: '#0a0a0a',
          gray: '#272727',
          lightgray: '#3f3f3f',
          hover: '#3d3d3d',
          text: '#AAAAAA',
          blue: '#3EA6FF',
        }
      },
      spacing: {
        'sidebar': '240px',
        'mini-sidebar': '72px',
        'header': '56px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
export default config
