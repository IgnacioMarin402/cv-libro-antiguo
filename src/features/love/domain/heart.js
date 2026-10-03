import { rand } from '@/shared/math/random'
import { easeOutQuint } from '@/shared/math/easing'

// The heart the visitor can give the project: it floats behind the book,
// circling slowly by the candle, and a click on it counts one heart (see
// server/love.js). Where it floats is the layout's call; how big it is,
// how it moves and what a click does to it are here.

// --- the shape --------------------------------------------------------------

// The heart in the room is the one on the counter (LoveCounter), built in
// three dimensions: a gold hairline round the whole curve, and inside it,
// across a dark gap, an ember — the same curve at 62% — burning with the
// loading screen's flame gradient. Every proportion below is the counter's.

// 6 cm across (6.7 tall), measured on the hairline: small next to a 39 cm
// page, big enough to hit — from the resting shot it stands 1.55 m off, and
// comes out about 60 px wide on a 1080 px screen.
export const HEART_WIDTH = 0.06

// The hairline: the counter's stroke, 1.4 units on its 32-unit heart
// (love.css), so 2.6 mm here — about 2.7 px from the resting shot.
export const RIM_WIDTH = (HEART_WIDTH * 1.4) / 32
export const RIM_COLOR = '#d6be96'
export const RIM_OPACITY = 0.7

// The ember, at the counter's 62%: a plate 3.7 cm across, 4 mm thick with
// its edges rounded, so it has some body when it rocks side-on.
export const EMBER_SCALE = 0.62
export const EMBER_DEPTH = 0.002
export const EMBER_BEVEL = 0.001

// Its gradient, stop for stop the counter's: centred 3 units under the
// middle of a heart 32 across and reaching 14 out, both given here as
// fractions of the ember's width. Past the last stop it stays that colour.
export const EMBER_STOPS = [
  [0, '#fff3cf'],
  [0.3, '#ffc868'],
  [0.7, '#ff8a2a'],
  [1, '#b8400c'],
]
export const EMBER_DROP = 3 / 32
export const EMBER_RADIUS = 14 / 32

// Not the round emoji heart, which reads as cute: a longer one, the lobes
// kept tight and the sides drawn out to a point, like the flame on the
// loading screen's seal — which is drawn the same way, in cubic Béziers.
// Its right half, clockwise from the cleft, in a box 2 wide (x ±1) and
// 2.18 tall (y from the point at −1.2 to the lobes' tops at 0.98), y up.
// Each segment is [control 1, control 2, end]. The sides meet at the point
// at 50°, where the round heart's meet at about 90°.
const CLEFT = [0, 0.5]
const RIGHT_HALF = [
  [[0.08, 0.8], [0.25, 0.98], [0.5, 0.98]],
  [[0.78, 0.98], [1, 0.78], [1, 0.5]],
  [[1, 0.05], [0.35, -0.45], [0, -1.2]],
]
const TOP = 0.98
const POINT = -1.2

// The whole outline, `width` across and centred on its own box — so it
// spins and pulses about its middle, not about the cleft: a start point and
// the Bézier segments that run once round from it, back to it. The left
// half is the right one mirrored and run backwards, point up to cleft.
// Both hearts draw it: the one in the room (geometry/heartGeometry) and the
// one on the counter (LoveCounter).
export function heartCurve(width) {
  const k = width / 2
  const middle = (TOP + POINT) / 2
  const at = ([x, y]) => [x * k, (y - middle) * k]
  const starts = [CLEFT, ...RIGHT_HALF.map(([, , end]) => end)]
  const mirror = ([x, y]) => [-x, y]
  const leftHalf = RIGHT_HALF.map(([c1, c2], i) => [mirror(c2), mirror(c1), mirror(starts[i])]).reverse()
  return {
    start: at(CLEFT),
    segments: [...RIGHT_HALF, ...leftHalf].map((segment) => segment.map(at)),
  }
}

// How much taller than wide the curve comes out.
export const HEART_ASPECT = (TOP - POINT) / 2

// The halo around it, 20 cm across: light spilling off the heart into the
// air, as the gem's does off the wizard's staff.
export const HALO_SIZE = 0.2
export const HALO_OPACITY = 0.45
// Brighter under the pointer, so the visitor knows it's there to be clicked.
export const HOVER_GLOW = 1.6

// And under the pointer it leans in before the click, the swell the click
// then finishes: it grows by 30% — the click's pop still takes it past
// that — and its ember burns a quarter brighter, with the halo's glow above.
// Eased in and out over about a third of a second (smoothDamp's smooth
// time), so it swells toward the pointer rather than snapping to it.
export const HOVER_SCALE = 1.3
export const HOVER_EMBER = 1.25
export const HOVER_SMOOTH_TIME = 0.12

// --- the float --------------------------------------------------------------

// A slow flat circle around its spot, one lap every 16 s, rising and falling
// 1.5 cm on a period that never lines up with the lap, so the path never
// repeats. The spot is measured against the circle's radius (see the
// layout): change one, measure the other again.
export const LOOP_RADIUS = 0.08
export const LOOP_PERIOD = 16
const BOB = 0.015
const BOB_PERIOD = 5.3

// Where the heart is at `seconds`, as an offset from its spot.
export function loopOffset(seconds) {
  const a = (seconds / LOOP_PERIOD) * Math.PI * 2
  return [
    LOOP_RADIUS * Math.cos(a),
    BOB * Math.sin((seconds / BOB_PERIOD) * Math.PI * 2),
    LOOP_RADIUS * Math.sin(a),
  ]
}

// It keeps its face to the visitor — side on, a heart is a sliver — but
// rocks either way by up to 17°, so it doesn't look pinned to the lens.
const ROCK = 0.3
const ROCK_PERIOD = 7
export const rock = (seconds) => ROCK * Math.sin((seconds / ROCK_PERIOD) * Math.PI * 2)

// A heartbeat, lub-dub, every 1.6 s: two swells of 6% and 3.5%, the second
// following the first as closely as a real one does.
const BEAT_PERIOD = 1.6
const LUB = 0.06
const DUB = 0.035
const swell = (x, at) => Math.exp(-(((x - at) / 0.05) ** 2))
export function beatScale(seconds) {
  const x = (seconds % BEAT_PERIOD) / BEAT_PERIOD
  return 1 + LUB * swell(x, 0.1) + DUB * swell(x, 0.28)
}

// The ember breathes as the counter's does: from 82% of its light to all
// of it and back, every 3.2 s.
const BREATH_PERIOD = 3.2
const BREATH_LOW = 0.82
export const emberBreath = (seconds) =>
  BREATH_LOW + ((1 - BREATH_LOW) / 2) * (1 - Math.cos((seconds / BREATH_PERIOD) * Math.PI * 2))

// The visitor's orbit can bring the lens right onto it. Rather than fill the
// screen with pink, it shrinks away between 25 and 10 cm from the camera.
const NEAR_FADE_FROM = 0.1
const NEAR_FADE_TO = 0.25
export function nearFade(distance) {
  const t = Math.min(1, Math.max(0, (distance - NEAR_FADE_FROM) / (NEAR_FADE_TO - NEAR_FADE_FROM)))
  return t * t * (3 - 2 * t)
}

// --- the click ----------------------------------------------------------------

// What a click does to the heart, by the seconds since it: it swells to
// 1.5 times its size, dips to 0.87 and settles — a damped spring —
// while it turns once round, fast then slowing. Both are done in 1.2 s and
// land exactly where they started: the spring at 1 (sin 4π), the turn a
// full 360°.
export const LOVE_DURATION = 1.2
const LOVE_POP = 0.9
export const loveScale = (s) =>
  s >= LOVE_DURATION ? 1 : 1 + LOVE_POP * Math.exp(-4.5 * s) * Math.sin((Math.PI * s) / 0.3)
export const loveSpin = (s) => (s >= LOVE_DURATION ? 0 : Math.PI * 2 * easeOutQuint(s / LOVE_DURATION))
// And its halo flares to three times its light, dying out over a second and
// a half.
export const LOVE_FLARE = 2
export const loveFlare = (s) => (s < 0 ? 0 : Math.exp(-3 * s))

// --- the burst ----------------------------------------------------------------

// The sparks it throws off: embers, in the loading screen's colours (its
// motes are #ffd699), mostly upward, drifting up as they slow, gone in 1.6 s.
export const BURST_COUNT = 40
export const BURST_LIFETIME = 1.6
const BURST_SPEED = [0.08, 0.24]
const BURST_RISE = 0.12
const BURST_DRAG = 2.2
const SPARK_COLORS = [
  [1, 0.84, 0.6],
  [1, 0.67, 0.31],
  [1, 0.95, 0.82],
]

export function createBurst(count = BURST_COUNT) {
  return {
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
  }
}

// Every spark back at `origin`, each off in its own direction: any way
// round, and from a little below the horizontal up to straight up.
export function scatterBurst(burst, origin) {
  const { positions, velocities, colors } = burst
  for (let i = 0; i < positions.length; i += 3) {
    const around = rand(0, Math.PI * 2)
    const up = rand(-0.3, 1)
    const flat = Math.sqrt(1 - up * up)
    const speed = rand(...BURST_SPEED)
    positions[i] = origin[0]
    positions[i + 1] = origin[1]
    positions[i + 2] = origin[2]
    velocities[i] = speed * flat * Math.cos(around)
    velocities[i + 1] = speed * up
    velocities[i + 2] = speed * flat * Math.sin(around)
    colors.set(SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)], i)
  }
}

export function driftBurst(burst, delta) {
  const { positions, velocities } = burst
  const drag = Math.exp(-BURST_DRAG * delta)
  for (let i = 0; i < positions.length; i += 3) {
    velocities[i] *= drag
    velocities[i + 1] = velocities[i + 1] * drag + BURST_RISE * delta
    velocities[i + 2] *= drag
    positions[i] += velocities[i] * delta
    positions[i + 1] += velocities[i + 1] * delta
    positions[i + 2] += velocities[i + 2] * delta
  }
}

// How much of the burst is left, 1 at the click to 0 at the end of its life.
export const burstOpacity = (s) => (s < 0 || s >= BURST_LIFETIME ? 0 : (1 - s / BURST_LIFETIME) ** 2)
