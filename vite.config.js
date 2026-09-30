import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// The love counter's /api/love, mounted in the dev and preview servers too —
// the same handler server/server.js runs in production, over the same kind
// of SQLite file. Imported only once a server starts, so `vite build` never
// opens a database.
const loveApi = () => {
  const mount = async (server) => {
    const { loveApi } = await import('./server/love.js')
    server.middlewares.use(loveApi())
  }
  return { name: 'love-api', configureServer: mount, configurePreviewServer: mount }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), loveApi()],
    resolve: {
      // '@' is the src root, so a feature is always imported by what it is
      // ('@/features/book') rather than by how far up the tree it happens
      // to sit from wherever it's used.
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: Number(env.PORT) || 5173,
    },
  }
})
