import { love } from './love.js'
import { treats } from './treats.js'

// The site on Cloudflare Workers (wrangler.jsonc): the built scene out of
// dist/ as static assets, and the two counters. Only /api/* reaches this
// code (run_worker_first); everything else Cloudflare serves from dist/
// without waking the Worker, so the scene costs no requests against its
// quota.
const ROUTES = { '/api/love': love, '/api/treats': treats }

export default {
  fetch(request, env) {
    const route = ROUTES[new URL(request.url).pathname]
    return route ? route(request, env) : env.ASSETS.fetch(request)
  },
}
