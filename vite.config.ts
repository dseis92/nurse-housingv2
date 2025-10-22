import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// minimal Vite config; Tailwind v4 is handled by its standalone CLI (no PostCSS)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  preview: {
    port: 5174
  }
})
