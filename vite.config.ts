import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/shiprocket': {
        target: 'https://apiv2.shiprocket.in/v1/external',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/shiprocket/, ''),
        secure: true,
      },
    },
  },
})

