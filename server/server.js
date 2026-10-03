import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { loveApi } from './love.js'

// The site in production: the built scene out of dist/ (`npm run build`
// first) and the love counter's /api/love, in one process with no
// dependencies. `npm start` runs it.
//
//   PORT         where it listens (3000 if unset); hosts usually set it
//   LOVE_DB      the SQLite file (data/love.db) — on a host, a path on a
//                persistent volume, or every deploy starts the count at 0
//   TRUST_PROXY  set it (to anything) when a reverse proxy sits in front,
//                or every visitor shares the proxy's IP (see server/love.js)

const ROOT = fileURLToPath(new URL('../dist/', import.meta.url))
const PORT = Number(process.env.PORT) || 3000

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.mp3': 'audio/mpeg',
  '.wasm': 'application/wasm',
}

// Text is gzipped once and kept: the bundle is a megabyte of three.js that
// goes down to about a quarter. So is the KTX2 transcoder's wasm (527 KB
// to 245). The models are streamed from disk as they are: packed by
// scripts/pack-glb.mjs, gzip takes 2-3% more off them.
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.wasm'])
const gzipped = new Map()

const love = loveApi()

async function serveStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' })
    return res.end()
  }

  let path
  try {
    path = resolve(ROOT, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname))
  } catch {
    res.writeHead(400)
    return res.end()
  }
  if (path !== ROOT.slice(0, -1) && !path.startsWith(ROOT)) {
    res.writeHead(404)
    return res.end()
  }

  let info = await stat(path).catch(() => null)
  if (info?.isDirectory()) {
    path = resolve(path, 'index.html')
    info = await stat(path).catch(() => null)
  }
  if (!info) {
    res.writeHead(404)
    return res.end()
  }

  const ext = extname(path)
  // Vite hashes everything under assets/ into its name, so those never
  // change. The rest (the page, the models) is checked again each visit —
  // a 304 when it hasn't changed.
  const immutable = path.startsWith(ROOT + 'assets' + sep)
  const modified = new Date(Math.floor(info.mtimeMs / 1000) * 1000)
  const headers = {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    'Last-Modified': modified.toUTCString(),
  }
  const since = Date.parse(req.headers['if-modified-since'])
  if (!immutable && since >= modified.getTime()) {
    res.writeHead(304, headers)
    return res.end()
  }

  if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    const key = path + ':' + info.mtimeMs
    if (!gzipped.has(key)) gzipped.set(key, gzipSync(await readFile(path)))
    const body = gzipped.get(key)
    res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', 'Content-Length': body.length, Vary: 'Accept-Encoding' })
    return res.end(req.method === 'HEAD' ? undefined : body)
  }

  res.writeHead(200, { ...headers, 'Content-Length': info.size })
  if (req.method === 'HEAD') return res.end()
  createReadStream(path).pipe(res)
}

createServer((req, res) => {
  love(req, res, () => {
    serveStatic(req, res).catch((error) => {
      console.error(error)
      if (!res.headersSent) res.writeHead(500)
      res.end()
    })
  })
}).listen(PORT, () => {
  console.log(`Libro antiguo en http://localhost:${PORT}`)
})
