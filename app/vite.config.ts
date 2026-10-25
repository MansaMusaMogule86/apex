import path from 'path'
import react from '@vitejs/plugin-react'
import type { Connect, PluginOption } from 'vite'
import { defineConfig } from 'vitest/config'
import { inspectAttr } from 'plugin-inspect-react-code'

function spaFallbackPlugin(): PluginOption {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req: Connect.IncomingMessage, _res: any, next: Connect.NextFunction) => {
        const url = req.url ?? '/'
        const hasFileExtension = /\.[^/]+$/.test(url)
        const shouldFallback = !hasFileExtension && !url.startsWith('/api') && !url.startsWith('/@') && !url.startsWith('/src') && !url.startsWith('/node_modules')

        if (shouldFallback) {
          req.url = '/index.html'
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react(), spaFallbackPlugin()],
  test: {
    environment: 'jsdom',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.APEX_API_PROXY_TARGET ?? 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
