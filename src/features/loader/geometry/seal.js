// The seal's layout, in the 200-unit SVG box its layers share, centred on
// the origin: the dial outside, the progress ring, a ring of dots inside
// it, and the flame in the middle.

export const RING_RADIUS = 74
export const DIAL = { inner: 84, outer: 88, long: 81, rim: 92, jewel: 96 }
export const DOTS = { radius: 60, count: 36 }

// Point on a circle of radius `r`, `p` of the way round, clockwise from
// the top — where the progress ring starts.
export const ringPoint = (p, r) => [r * Math.sin(p * Math.PI * 2), -r * Math.cos(p * Math.PI * 2)]

// One path for all 72 ticks: one every 5 degrees, a longer one every 30.
export function tickPath() {
  let d = ''
  for (let i = 0; i < 72; i++) {
    const p = i / 72
    const [x1, y1] = ringPoint(p, i % 6 === 0 ? DIAL.long : DIAL.inner)
    const [x2, y2] = ringPoint(p, DIAL.outer)
    d += `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`
  }
  return d
}
