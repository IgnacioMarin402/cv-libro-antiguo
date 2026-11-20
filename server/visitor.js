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
