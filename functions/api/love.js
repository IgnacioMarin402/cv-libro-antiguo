import { counter } from '../../server/cloudflare.js'

// /api/love on Cloudflare Pages: server/love.js, on D1 (see server/cloudflare.js).
//
// GET  → { count, loved }   loved: whether this visitor already has
// POST → { count, loved }   gives this visitor's heart; a second one changes nothing
export const onRequest = ({ request, env }) =>
  counter(request, env, async (db, visitor, isPost) => {
    if (isPost) await db.prepare('INSERT OR IGNORE INTO love (visitor) VALUES (?)').bind(visitor).run()
    const [count, has] = await db.batch([
      db.prepare('SELECT COUNT(*) AS n FROM love'),
      db.prepare('SELECT 1 AS yes FROM love WHERE visitor = ?').bind(visitor),
    ])
    return { count: count.results[0].n, loved: has.results.length > 0 }
  })
