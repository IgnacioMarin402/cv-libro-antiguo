import { visitorKey } from '../visitor.js'

// The counters on Cloudflare Workers: what server/love.js and server/treats.js
// do in Node, for love.js and treats.js beside this file. Same routes, same
// answers, so the page can't tell which one it's talking to.
//
// What changes is underneath. The SQLite file is a D1 database, bound as DB
// in wrangler.jsonc; with no binding the API answers 503 and the page hides
// the counters, as it does on a static host. The
// address is CF-Connecting-IP, which Cloudflare writes itself on every
// request and overwrites if the client sent one — there is no proxy to trust
// or not. The HMAC is Web Crypto, keyed as createHmac keys it (the hex text
// of the salt), so a love.db moved into D1 keeps telling visitors apart.

// The tables of love.js and treats.js, made the first time an isolate
// answers, so a new D1 database needs no migration step: create it, bind it,
// deploy. The salt is made here too, once, like the Node server does.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS love (
    visitor TEXT PRIMARY KEY,
    at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE TABLE IF NOT EXISTS treats (
    visitor TEXT NOT NULL,
    day TEXT NOT NULL,
    n INTEGER NOT NULL,
    PRIMARY KEY (visitor, day)
  )`,
  `CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
]

const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
const base64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

// One setup per isolate. A failed one is forgotten, so the next request
// tries again instead of every request after it failing the same way.
let ready = null
function setup(db) {
  ready ??= (async () => {
    const salt = hex(crypto.getRandomValues(new Uint8Array(32)))
    await db.batch([
      ...SCHEMA.map((sql) => db.prepare(sql)),
      db.prepare(`INSERT OR IGNORE INTO meta (key, value) VALUES ('salt', ?)`).bind(salt),
    ])
    const stored = await db.prepare(`SELECT value FROM meta WHERE key = 'salt'`).first('value')
    return crypto.subtle.importKey('raw', new TextEncoder().encode(stored), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  })().catch((error) => {
    ready = null
    throw error
  })
  return ready
}

// node:net's isIP isn't here. visitorKey assumes a real address (a 9-group
// IPv6 made it call Array(-1)); Cloudflare only ever sends one, but the
// check is cheap and keeps that true if the header ever comes from elsewhere.
// The URL parser is a full IPv6 validator.
function isIp(ip) {
  if (!ip) return false
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip.split('.').every((part) => Number(part) <= 255)
  if (!ip.includes(':') || !/^[0-9a-fA-F:.]+$/.test(ip)) return false
  try {
    new URL(`http://[${ip}]/`)
    return true
  } catch {
    return false
  }
}

// The headers server/server.js sends on every answer (see there for why);
// public/_headers gives the same ones to the static files.
const HEADERS = {
  'Content-Security-Policy': "frame-ancestors 'none'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
}

const empty = (status, extra = {}) => new Response(null, { status, headers: { ...HEADERS, ...extra } })

// The guards of the Node handlers, in the same order: only GET and POST, a
// POST only from this site's own page (Sec-Fetch-Site), only from an
// address. Then answer(db, visitor, isPost) returns the JSON body.
export async function counter(request, env, answer) {
  const { method } = request
  if (method !== 'GET' && method !== 'POST') return empty(405, { Allow: 'GET, POST' })
  const site = request.headers.get('Sec-Fetch-Site')
  if (method === 'POST' && site && site !== 'same-origin') return empty(403)
  const ip = request.headers.get('CF-Connecting-IP')
  if (!isIp(ip)) return empty(400)
  if (!env.DB) return empty(503)

  try {
    const key = await setup(env.DB)
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(visitorKey(ip)))
    const body = await answer(env.DB, base64url(new Uint8Array(mac)), method === 'POST')
    return new Response(JSON.stringify(body), { headers: { ...HEADERS, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error(error)
    return empty(500)
  }
}
