import { counter } from './counter.js'

// /api/treats on Cloudflare: server/treats.js, on D1 (see counter.js).
//
// GET  → { count, left }          left: what this visitor can still give today
// POST → { count, left, given }   gives one; given is false when today's are all given
const DAILY_LIMIT = 3

// The Node server's day is its own local time. A Worker has none — it runs
// wherever the visitor is, on UTC — so the day is Chile's, where that server
// would have stood. TREATS_TIME_ZONE (a var in wrangler.jsonc) changes it.
const today = (timeZone) => new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date())

export const treats = (request, env) =>
  counter(request, env, async (db, visitor, isPost) => {
    const day = today(env.TREATS_TIME_ZONE || 'America/Santiago')
    let given
    if (isPost) {
      // One statement, so two treats sent at once can't both slip under the
      // limit: the row only grows while it's under it.
      const result = await db
        .prepare(
          `INSERT INTO treats (visitor, day, n) VALUES (?, ?, 1)
           ON CONFLICT (visitor, day) DO UPDATE SET n = n + 1 WHERE n < ${DAILY_LIMIT}`
        )
        .bind(visitor, day)
        .run()
      given = result.meta.changes > 0
    }
    const [total, mine] = await db.batch([
      db.prepare('SELECT COALESCE(SUM(n), 0) AS n FROM treats'),
      db.prepare('SELECT n FROM treats WHERE visitor = ? AND day = ?').bind(visitor, day),
    ])
    const left = DAILY_LIMIT - (mine.results[0]?.n ?? 0)
    return { count: total.results[0].n, left, ...(isPost ? { given } : {}) }
  })
