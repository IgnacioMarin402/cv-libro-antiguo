// The database: D1, which is SQLite, bound as env.DB (see wrangler.jsonc).
// Hearts and treats in one database, as they were in love.db, with one
// salt, so a visitor is the same visitor in both.
//
// The tables are made here, IF NOT EXISTS, rather than by wrangler's
// migrations: one step less on a first deploy and in `npm run dev`, whose
// local D1 starts empty. Once per isolate — a Worker's module scope lives
// across the requests one isolate serves.
//
// A table is never renamed here without carrying its rows over: going from
// cookies to treats once left every treat given in the old table and set
// the count back to 0.
let ready = null

function prepare(db) {
  return (async () => {
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS love (
        visitor TEXT PRIMARY KEY,
        at INTEGER NOT NULL DEFAULT (unixepoch())
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS treats (
        visitor TEXT NOT NULL,
        day TEXT NOT NULL,
        n INTEGER NOT NULL,
        PRIMARY KEY (visitor, day)
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`),
    ])
    // Made the first time the database is opened, kept for good: a new salt
    // would make every visitor new, and give them another heart.
    const fresh = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, '0')).join('')
    await db.prepare(`INSERT OR IGNORE INTO meta (key, value) VALUES ('salt', ?)`).bind(fresh).run()
    return (await db.prepare(`SELECT value FROM meta WHERE key = 'salt'`).first('value'))
  })()
}

// The salt, once the tables are there. A failed first try isn't kept, so
// the next request tries again.
export function openStore(db) {
  if (!ready) ready = prepare(db).catch((error) => {
    ready = null
    throw error
  })
  return ready
}
