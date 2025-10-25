import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: { DEFAULT:'#2563eb', 600:'#2563eb', 700:'#1d4ed8' } }
    }
  }
} satisfies Config
