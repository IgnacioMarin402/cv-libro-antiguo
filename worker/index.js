import { love } from './love.js'
import { treats } from './treats.js'
import { openStore } from './store.js'
import { clientIp, visitorId } from './visitor.js'

// The site on Cloudflare: the built scene is static assets, served by
// Cloudflare without this Worker running (see wrangler.jsonc), and this
// Worker answers only /api/* — the love counter's /api/love and the bust's
// /api/treats, over D1. Security headers for the assets are in
// public/_headers; these are the same, for the API's answers.
const SECURITY_HEADERS = {
  'Content-Security-Policy': "frame-ancestors 'none'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

const ROUTES = { '/api/love': love, '/api/treats': treats }

const reply = (status, body, headers = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: {
      ...SECURITY_HEADERS,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }),
      ...headers,
    },
  })

export default {
  async fetch(request, env) {
    const route = ROUTES[new URL(request.url).pathname]
    if (!route) return reply(404)

    if (request.method !== 'GET' && request.method !== 'POST') return reply(405, undefined, { Allow: 'GET, POST' })
    // A heart or a treat is given from this site's own page. Without this,
    // any other site could have its visitors' browsers POST here and give
    // theirs unasked. Browsers since 2023 send Sec-Fetch-Site on every
    // fetch; a client that doesn't (curl, a script) can spoof it anyway,
    // and is held to one heart and three treats a day per IP like everyone.
    const site = request.headers.get('Sec-Fetch-Site')
    if (request.method === 'POST' && site && site !== 'same-origin') return reply(403)
    const ip = clientIp(request)
    if (!ip) return reply(400)

    try {
      const salt = await openStore(env.DB)
      return reply(200, await route(request, env.DB, await visitorId(salt, ip)))
    } catch (error) {
      console.error(error)
      return reply(500)
    }
  },
}
