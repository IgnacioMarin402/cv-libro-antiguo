import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
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
