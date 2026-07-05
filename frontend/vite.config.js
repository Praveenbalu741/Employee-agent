import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiServer = env.VITE_API_SERVER || 'http://localhost:5000'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5173,
      proxy: {
        // Proxy API calls to Express backend
        '/api': {
          target: apiServer,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
