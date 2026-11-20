import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Destinos del proxy de desarrollo (`npm run dev`), configurables por variable
  // de entorno o en un fichero .env.local. En produccion lo hace nginx.
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.BACKEND_URL ?? 'http://localhost:8080'
  const auth = env.AUTH_URL ?? 'http://localhost:9000'

  return {
    base: '/aquaapp/',
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: backend, changeOrigin: true },
        // /auth/login -> {AUTH_URL}/login (se quita el prefijo, igual que nginx)
        '/auth': {
          target: auth,
          changeOrigin: true,
          rewrite: (ruta: string) => ruta.replace(/^\/auth/, ''),
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  }
})
