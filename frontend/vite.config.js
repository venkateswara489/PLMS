import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  // Production build configuration
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://plms-2xk7.onrender.com')
  }
})
