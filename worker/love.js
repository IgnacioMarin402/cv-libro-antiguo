// The love counter: how many visitors have clicked the heart, one each.
//
// "One each" is one per IP (see visitor.js), and the IP itself is never
// stored — only an HMAC of it, keyed with a random salt. That is enough to
// tell whether an address has already given its heart, and a leaked
// database lists no one's address. It is not anonymity: the salt lives in
// the same database, so the IPv4 space could still be brute-forced against
// it. For a like button, that is the right weight.
//
// One row per visitor: the count is COUNT(*).
//
// GET  /api/love → { count, loved }   loved: whether this visitor already has
// POST /api/love → { count, loved }   gives this visitor's heart; a second
//                                     one changes nothing
export async function love(request, db, visitor) {
  const reads = [
    db.prepare('SELECT COUNT(*) AS n FROM love'),
    db.prepare('SELECT 1 AS yes FROM love WHERE visitor = ?').bind(visitor),
  ]
  // In one batch, so the count already has this heart in it.
  const add = db.prepare('INSERT OR IGNORE INTO love (visitor) VALUES (?)').bind(visitor)
  const results = await db.batch(request.method === 'POST' ? [add, ...reads] : reads)
  const [count, has] = results.slice(-2)
  return { count: count.results[0].n, loved: has.results.length > 0 }
}
