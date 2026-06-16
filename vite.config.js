import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Base path for GitHub Pages — must match the repo name
  base: '/digipay-web/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000
  }
})
