import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET ?? 'https://ebind-dev.egl-cloud.com'

  return {
    plugins: [vue(), vuetify({ autoImport: true })],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // 0.0.0.0 para que el contenedor exponga el dev server al host
      host: true,
      port: 5173,
      strictPort: true,
      watch: {
        // Necesario para hot-reload sobre bind mounts en Docker Desktop (Windows/macOS)
        usePolling: true,
        interval: 300,
      },
      // El API de origen no habilita CORS para localhost: el dev server actúa de proxy.
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
