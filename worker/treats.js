// The treats given to Shourdo's bust: how many in all, from everyone.
//
// Unlike the heart, a visitor gives more than one — up to DAILY_LIMIT a day,
// for a sane diet — so the total can grow without end, and it's SUM(n), not
// COUNT(*).
export const DAILY_LIMIT = 3

// The day is Chile's: the backlog asked for the server's clock, and the
// server was in Chile. A Worker runs wherever the visitor is, in UTC, and
// with UTC Chile's day would turn at 21:00. en-CA writes dates as
// YYYY-MM-DD, as SQLite's date() did.
const DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' })
export const today = (now = new Date()) => DAY.format(now)

// GET  /api/treats → { count, left }          left: what this visitor can
//                                              still give today
// POST /api/treats → { count, left, given }   gives one; given is false
//                                              when today's are all given
export async function treats(request, db, visitor) {
  const day = today()
  const reads = [
    db.prepare('SELECT COALESCE(SUM(n), 0) AS n FROM treats'),
    db.prepare('SELECT n FROM treats WHERE visitor = ? AND day = ?').bind(visitor, day),
  ]
  // One statement, so two treats sent at once can't both slip under the
  // limit: the row only grows while it's under it, and when it doesn't,
  // nothing changed.
  const give = db
    .prepare(
      `INSERT INTO treats (visitor, day, n) VALUES (?, ?, 1)
       ON CONFLICT (visitor, day) DO UPDATE SET n = n + 1 WHERE n < ${DAILY_LIMIT}`
    )
    .bind(visitor, day)
  const post = request.method === 'POST'
  const results = await db.batch(post ? [give, ...reads] : reads)
  const [total, mine] = results.slice(-2)
  const answer = {
    count: total.results[0].n,
    left: Math.max(0, DAILY_LIMIT - (mine.results[0]?.n ?? 0)),
  }
  return post ? { ...answer, given: results[0].meta.changes > 0 } : answer
}
