import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    open :true,
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://laptop-friendly-places-backend.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
