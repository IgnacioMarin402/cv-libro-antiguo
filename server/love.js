import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { createHmac, randomBytes } from 'node:crypto'
import { isIP } from 'node:net'
import { DatabaseSync } from 'node:sqlite'

// The love counter: how many visitors have clicked the heart, one each.
//
// "One each" is one per IP, and the IP itself is never stored — only an
// HMAC of it, keyed with a random salt made the first time the database is
// opened. That is enough to tell whether an address has already given its
// heart, and a leaked love.db lists no one's address. It is not anonymity:
// the salt lives in the same file, so the IPv4 space could still be
// brute-forced against it. For a like button, that is the right weight.
//
// One file, one table, one row per visitor: the count is COUNT(*). SQLite is
// node:sqlite, built into Node since 22.13 — no dependency to install.

// An IPv6 connection is a /64, not one address: a home line gets the whole
// block and the system rotates through it (privacy extensions hand out a
// new temporary address every day). Counting full addresses would let the
// same visitor give a new heart each morning without trying. IPv4 is kept
// whole, and an IPv4 arriving as IPv6-mapped (::ffff:1.2.3.4) is IPv4.
export function visitorKey(ip) {
  const address = ip.replace(/^::ffff:(?=\d+\.)/, '').split('%')[0]
  if (!address.includes(':')) return address
  const [head, tail] = address.split('::')
  const left = head ? head.split(':') : []
  const right = tail ? tail.split(':') : []
  const groups = address.includes('::') ? [...left, ...Array(8 - left.length - right.length).fill('0'), ...right] : left
  return groups.slice(0, 4).map((g) => parseInt(g || '0', 16).toString(16)).join(':') + '::/64'
}

// Where the visit came from. Straight off the socket unless the server sits
// behind a reverse proxy (Railway, Fly, Render, an nginx in front): there
// every request arrives from the proxy, so everyone would share its one
// address and the counter would stop at 1. TRUST_PROXY says so, and then
// the address is the LAST in X-Forwarded-For — the one the proxy itself
// appended. Earlier entries are whatever the client chose to send.
//
// Anything that isn't an address is refused (null): visitorKey assumes one,
// and a request that reached the server without passing through the proxy
// writes the header itself. A 9-group IPv6 there (1:2:3:4:5:6:7:8::9) made
// visitorKey call Array(-1) and took the whole process down.
export function clientIp(req, trustProxy) {
  const forwarded = trustProxy && req.headers['x-forwarded-for']
  const ip = forwarded ? forwarded.split(',').at(-1).trim() : req.socket.remoteAddress
  return isIP(ip) ? ip : null
}

function openStore(file) {
  mkdirSync(dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(`
    CREATE TABLE IF NOT EXISTS love (
      visitor TEXT PRIMARY KEY,
      at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
  db.prepare(`INSERT OR IGNORE INTO meta (key, value) VALUES ('salt', ?)`).run(randomBytes(32).toString('hex'))
  const salt = db.prepare(`SELECT value FROM meta WHERE key = 'salt'`).get().value

  const add = db.prepare('INSERT OR IGNORE INTO love (visitor) VALUES (?)')
  const has = db.prepare('SELECT 1 FROM love WHERE visitor = ?')
  const count = db.prepare('SELECT COUNT(*) AS n FROM love')

  return {
    visitor: (ip) => createHmac('sha256', salt).update(visitorKey(ip)).digest('base64url'),
    add: (visitor) => add.run(visitor),
    has: (visitor) => has.get(visitor) !== undefined,
    count: () => count.get().n,
  }
}

// GET  /api/love → { count, loved }   loved: whether this visitor already has
// POST /api/love → { count, loved }   gives this visitor's heart; a second
//                                     one changes nothing
//
// Connect-style (req, res, next), so the same handler is mounted by the
// production server (server/server.js) and by Vite in development (see
// vite.config.js). Anything that isn't /api/love goes on to next().
//
// TRUST_PROXY is exactly '1': Boolean() of an env var is true for any text,
// so TRUST_PROXY=false and TRUST_PROXY=0 used to turn it on.
export function loveApi({ file = process.env.LOVE_DB || 'data/love.db', trustProxy = process.env.TRUST_PROXY === '1' } = {}) {
  const store = openStore(file)

  return (req, res, next) => {
    if (req.url.split('?')[0] !== '/api/love') return next()

    if (req.method !== 'GET' && req.method !== 'POST') {
      res.writeHead(405, { Allow: 'GET, POST' })
      return res.end()
    }
    // A heart is given from this site's own page. Without this, any other
    // site could have its visitors' browsers POST here and give theirs
    // unasked. Browsers since 2023 send Sec-Fetch-Site on every fetch; a
    // client that doesn't (curl, a script) can spoof it anyway, and is
    // held to one heart per IP like everyone else.
    const site = req.headers['sec-fetch-site']
    if (req.method === 'POST' && site && site !== 'same-origin') {
      res.writeHead(403)
      return res.end()
    }
    const ip = clientIp(req, trustProxy)
    if (!ip) {
      res.writeHead(400)
      return res.end()
    }

    // server.js calls this outside any promise, so an error thrown here
    // would take down the whole site, not just the counter — and SQLite
    // throws too (a full disk, a locked file).
    try {
      const visitor = store.visitor(ip)
      if (req.method === 'POST') store.add(visitor)
      const body = JSON.stringify({ count: store.count(), loved: store.has(visitor) })
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      res.end(body)
    } catch (error) {
      console.error(error)
      res.writeHead(500)
      res.end()
    }
  }
}
