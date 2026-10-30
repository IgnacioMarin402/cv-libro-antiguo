// A cookie for Shourdo, thrown from the visitor's side of the lens into his
// mouth, and the two hearts he gives back for it. In metres and seconds:
// the cookie flies in the room, not in the bust's units.

// A round biscuit 6 cm across and 1.2 cm thick, its rim rounded: a dog
// biscuit is 4 to 5 cm, and he's twice life-size. Its silhouette for the
// lathe, [radius, height] from its middle underneath up to its middle on
// top, centred on its own middle.
export const COOKIE_RADIUS = 0.03
const COOKIE_THICKNESS = 0.012
const RIM = 0.005
export const COOKIE_PROFILE = (() => {
  const half = COOKIE_THICKNESS / 2
  const flat = COOKIE_RADIUS - RIM
  const profile = [[0, -half]]
  // The rim, a half-round of the thickness's radius, in eight steps.
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI
    profile.push([flat + RIM * Math.cos(a), half * Math.sin(a)])
  }
  profile.push([0, half])
  return profile
})()

// Its colours: a baked biscuit, darker toward the rim, with chocolate chips.
export const COOKIE_COLORS = { dough: '#c48a4a', baked: '#8a5626', chip: '#3b2314' }
export const COOKIE_CHIPS = 9

// Where it's thrown from, off the lens: 30 cm in front of it, 12 cm under
// the middle of the screen and 8 cm to its right — the visitor's hand, low
// and to one side, so it comes into view from the bottom right.
export const THROW_FROM = { ahead: 0.3, down: 0.12, right: 0.08 }

// The throw: 0.6 s, over an arc 12 cm higher than the straight line at its
// top, the cookie turning over twice on the way.
export const FLIGHT = 0.6
const ARC = 0.12
export const SPINS = 2

// Where the cookie is, `t` of the way through its flight (0..1), from
// `from` to `to` ([x, y, z]): along the line, lifted by the arc.
export function flightPoint(from, to, t) {
  const lift = 4 * ARC * t * (1 - t)
  return from.map((a, i) => a + (to[i] - a) * t + (i === 1 ? lift : 0))
}

// The hearts: two, one off each side of his head, 1.5 times the love
// heart's size, rising 14 cm over the 2 s they last and swaying 1.5 cm
// sideways. They fade in over the first fifth and out over the last
// half. Each starts a little after the other, so they don't move in step.
// Where they start is in the bust's units, by the top of his head: the
// skull tops out at y = 84.7, the ears reach x = -16 and 22.
export const HEARTS = [
  { from: [-11, 82, 22], delay: 0 },
  { from: [19, 84, 22], delay: 0.18 },
]
export const HEART_SCALE = 1.5
export const HEART_LIFE = 2
const HEART_RISE = 0.14
const HEART_SWAY = 0.015

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// A heart `age` seconds after it set off: how far it has risen and swayed
// (metres) and how much of it shows (0..1). Not there before or after.
export function heartAt(age, index) {
  if (!(age >= 0 && age <= HEART_LIFE)) return { rise: 0, sway: 0, opacity: 0 }
  const t = age / HEART_LIFE
  return {
    rise: HEART_RISE * (1 - (1 - t) * (1 - t)),
    sway: HEART_SWAY * Math.sin(age * 4 + index * 2),
    opacity: smoothstep(0, 0.2, t) * (1 - smoothstep(0.5, 1, t)),
  }
}
