// Who a visit comes from, as the heart and the treats tell visitors apart:
// an HMAC of their address, keyed with a salt kept in the database (see
// store.js). The address itself is never stored.

// An IPv6 connection is a /64, not one address: a home line gets the whole
// block and the system rotates through it (privacy extensions hand out a
// new temporary address every day). Counting full addresses would let the
// same visitor give a new heart each morning without trying. IPv4 is kept
// whole, and an IPv4 arriving as IPv6-mapped (::ffff:1.2.3.4) is IPv4.
export function visitorKey(ip) {
  const address = ip.replace(/^::ffff:(?=\d+\.)/i, '').split('%')[0]
  if (!address.includes(':')) return address
  const [head, tail] = address.split('::')
  const left = head ? head.split(':') : []
  const right = tail ? tail.split(':') : []
  const groups = address.includes('::') ? [...left, ...Array(8 - left.length - right.length).fill('0'), ...right] : left
  return groups.slice(0, 4).map((g) => parseInt(g || '0', 16).toString(16)).join(':') + '::/64'
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/

// node:net's isIP isn't in a Worker. An IPv6 is whatever the URL parser
// takes as a host in brackets — it holds to the RFC, and a 9-group address
// (1:2:3:4:5:6:7:8::9), which made visitorKey call Array(-1) and took the
// old server down, is refused there.
function isIP(ip) {
  if (IPV4.test(ip)) return true
  if (!ip.includes(':')) return false
  try {
    new URL(`http://[${ip.split('%')[0]}]/`)
    return true
  } catch {
    return false
  }
}

// Cloudflare sets CF-Connecting-IP itself, on every request, to the address
// that reached it; whatever the client sent under that name is overwritten.
// So there's no proxy to trust or not, as there was behind a VPS's Caddy.
// Anything that isn't an address is refused (null).
export function clientIp(request) {
  const ip = request.headers.get('CF-Connecting-IP')
  return ip && isIP(ip) ? ip : null
}

const encoder = new TextEncoder()
const toBase64Url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export async function visitorId(salt, ip) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(salt), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(visitorKey(ip))))
}
