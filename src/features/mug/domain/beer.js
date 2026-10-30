// The tankard filling with beer when the visitor goes to look at it: it
// shakes, the beer rises inside it and a head of foam swells up over the
// rim. Once a visit — a page load: it stays full from then on.
//
// In the model's units (see domain/mug), where it stands 0.975 tall.

// It's hollow: measured over its vertices, the inside wall — the surface
// facing its axis — runs round x = -0.133, z = 0 (the handle is on +x),
// 0.249 out at y = 0.25, 0.262 at 0.55, 0.275 at 0.83 and 0.277 at the
// top; the inside floor is at y = 0.170 and the rim's top at 0.909. The
// wall is 0.03 thick at the rim and more below.
export const AXIS = [-0.133, 0, 0]
const FLOOR = 0.17
export const RIM = 0.909

// The beer and the foam are cut 0.28 round: past the wall's inside
// everywhere up the inside, so no gap shows against it, and short of its
// outside everywhere, so they never come through it.
export const BEER_RADIUS = 0.28

// Full, the beer stops 0.07 under the rim (2 cm at its size), and the foam
// stands on it up to 0.09 over the rim, its edge rolling out 0.025 past the
// rim's inside onto it — a head that's just come up, not one spilling.
export const BEER_LEVEL = RIM - 0.07
export const FOAM_TOP = RIM + 0.09
export const FOAM_LIP = 0.025

// The head's silhouette for the lathe, [radius, height over the beer], from
// its middle on top down and out over the rim and back in under it to the
// beer: a dome flattened on top, bulging over the rim.
export const FOAM_PROFILE = (() => {
  const top = FOAM_TOP - BEER_LEVEL
  const rimOver = RIM - BEER_LEVEL
  const out = BEER_RADIUS + FOAM_LIP
  const profile = []
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * (Math.PI / 2)
    profile.push([out * Math.sin(a), rimOver + (top - rimOver) * Math.cos(a)])
  }
  profile.push([out - 0.008, rimOver - 0.012], [BEER_RADIUS, rimOver - 0.03], [BEER_RADIUS, 0])
  return profile.reverse()
})()

// Bubbles in the head: its surface lifted and sunk by up to 0.012 in small
// lumps, so it reads as froth and not a cap.
export const FOAM_LUMPS = 0.012

export const BEER_COLOR = '#b8741a'
export const FOAM_COLOR = '#f2e6cc'

// The pour, in seconds from when the camera has come: the tankard shakes
// for 1.8 s; the beer rises from the floor to its level from 0.2 to 1.6;
// the head forms on it from 0.6 and has swelled up by 2.4, a little past
// its size, settling back by 3.
const SHAKE = [0, 1.8]
const FILL = [0.2, 1.6]
const HEAD = [0.6, 2.4]
const SETTLE = 3
const OVERSHOOT = 0.06

// The shake: up to 1.4° of tilt each way and 1° of turn, at 17 and 23
// shakes a second, so it never repeats; and a hop of 0.004 (1.2 mm). It
// comes in and goes out over its first and last quarter-second.
const TILT = (1.4 * Math.PI) / 180
const TURN = (1 * Math.PI) / 180
const HOP = 0.004

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// The pour `since` seconds after it began (null before it ever has): the
// tankard's shake, how far up it the beer is, and how much of the head has
// formed (0..1, past 1 while it overshoots).
export function pour(since) {
  if (since === null) return { tilt: 0, roll: 0, turn: 0, hop: 0, level: null, head: 0 }
  const envelope = smoothstep(SHAKE[0], SHAKE[0] + 0.25, since) * (1 - smoothstep(SHAKE[1] - 0.25, SHAKE[1], since))
  const fill = smoothstep(FILL[0], FILL[1], since)
  const grown = smoothstep(HEAD[0], HEAD[1], since)
  const settle = smoothstep(HEAD[1], SETTLE, since)
  return {
    tilt: TILT * envelope * Math.sin(since * 2 * Math.PI * 17),
    roll: TILT * envelope * Math.sin(since * 2 * Math.PI * 23 + 1.3),
    turn: TURN * envelope * Math.sin(since * 2 * Math.PI * 11 + 0.4),
    hop: HOP * envelope * Math.abs(Math.sin(since * 2 * Math.PI * 9)),
    level: FLOOR + (BEER_LEVEL - FLOOR) * fill,
    head: grown * (1 + OVERSHOOT * (1 - settle)),
  }
}

// What the camera frames when it's clicked: the whole tankard with its
// head, 0.4 tall and as wide round the middle of its body — from the table
// to over the foam — looked at from 35° above level, so the beer and the
// head show over the rim. Seen down that slant the framed square stands
// square to it. In the model's units, off its origin.
export const FRAMING = { center: [AXIS[0] + 0.12, 0.5, 0], size: 1.3 }
export const LOOK_DOWN = (35 * Math.PI) / 180

// When the visitor has arrived: the lens within 3 cm of the line out of the
// framing's middle and within 2° of looking straight down it, as for the
// portrait and the bust (in metres; the mug turns it into its units).
export const ARRIVED_OFFSET = 0.03
export const ARRIVED_ANGLE = (2 * Math.PI) / 180
