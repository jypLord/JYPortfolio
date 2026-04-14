import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chart': {
        target: 'https://api.jyportfolio.site',
        changeOrigin: true,
        secure: true,
      },
      '/watchlist': {
        target: 'https://api.jyportfolio.site',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
