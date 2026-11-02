import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // cloudflare() runs worker/index.js — the love counter's /api/love and
    // the bust's /api/treats — in dev and preview too, in Cloudflare's own
    // runtime and over a local D1 (.wrangler/), so `npm run dev` already
    // counts. It builds the Worker beside the scene, and `wrangler deploy`
    // takes both from dist/.
    plugins: [react(), cloudflare()],
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
    // Two pages: the scene, and the CV as a page of its own (cv/index.html,
    // at /cv/ — Cloudflare's assets serve a folder's index.html). Set on the
    // client alone: under build, the Worker's build took them as its entries
    // too and failed.
    environments: {
      client: {
        build: {
          rollupOptions: {
            input: {
              main: fileURLToPath(new URL('./index.html', import.meta.url)),
              cv: fileURLToPath(new URL('./cv/index.html', import.meta.url)),
            },
          },
        },
      },
    },
  }
})
