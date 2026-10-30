import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { createHmac, randomBytes } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { clientIp, visitorKey } from './love.js'

// The treats given to Shourdo's bust: how many in all, from everyone.
//
// Unlike the heart, a visitor gives more than one — up to DAILY_LIMIT a day,
// for a sane diet — so the total can grow without end, and it's SUM(n), not
// COUNT(*). The day is the server's own, in its local time zone: the
// backlog asked for the server's clock, and SQLite's date('now') alone is
// UTC.
//
// Visitors are told apart as the heart tells them: an HMAC of their IP (an
// IPv6 /64), with the same salt, kept in the same file (see server/love.js).
export const DAILY_LIMIT = 3

function openStore(file) {
  mkdirSync(dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(`
    CREATE TABLE IF NOT EXISTS treats (
      visitor TEXT NOT NULL,
      day TEXT NOT NULL,
      n INTEGER NOT NULL,
      PRIMARY KEY (visitor, day)
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
  db.prepare(`INSERT OR IGNORE INTO meta (key, value) VALUES ('salt', ?)`).run(randomBytes(32).toString('hex'))
  const salt = db.prepare(`SELECT value FROM meta WHERE key = 'salt'`).get().value

  // One statement, so two treats sent at once can't both slip under the
  // limit: the row only grows while it's under it, and when it doesn't,
  // nothing changed.
  const give = db.prepare(`
    INSERT INTO treats (visitor, day, n) VALUES (?, date('now', 'localtime'), 1)
    ON CONFLICT (visitor, day) DO UPDATE SET n = n + 1 WHERE n < ${DAILY_LIMIT}
  `)
  const today = db.prepare(`SELECT n FROM treats WHERE visitor = ? AND day = date('now', 'localtime')`)
  const total = db.prepare('SELECT COALESCE(SUM(n), 0) AS n FROM treats')

  return {
    visitor: (ip) => createHmac('sha256', salt).update(visitorKey(ip)).digest('base64url'),
    give: (visitor) => give.run(visitor).changes > 0,
    left: (visitor) => DAILY_LIMIT - (today.get(visitor)?.n ?? 0),
    count: () => total.get().n,
  }
}

// GET  /api/treats → { count, left }          left: what this visitor can
//                                              still give today
// POST /api/treats → { count, left, given }   gives one; given is false
//                                              when today's are all given
//
// Connect-style, mounted beside /api/love by server/server.js and by Vite,
// with the same guards: only GET and POST, only from this site's own page,
// only from an address.
export function treatsApi({ file = process.env.LOVE_DB || 'data/love.db', trustProxy = process.env.TRUST_PROXY === '1' } = {}) {
  const store = openStore(file)

  return (req, res, next) => {
    if (req.url.split('?')[0] !== '/api/treats') return next()

    if (req.method !== 'GET' && req.method !== 'POST') {
      res.writeHead(405, { Allow: 'GET, POST' })
      return res.end()
    }
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

    try {
      const visitor = store.visitor(ip)
      const answer = req.method === 'POST' ? { given: store.give(visitor) } : {}
      const body = JSON.stringify({ count: store.count(), left: store.left(visitor), ...answer })
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      res.end(body)
    } catch (error) {
      console.error(error)
      res.writeHead(500)
      res.end()
    }
  }
}
