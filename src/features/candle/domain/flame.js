// How a candle flame behaves over time. A candle burns laminar: its flame
// keeps one teardrop shape and moves as a whole — it leans on the room's
// drafts, stretches, settles — instead of churning the way a bonfire does.
// So everything here is slow and continuous in time. (The first flame drew
// a fresh random number for the light every frame, which read as a bad
// connection rather than as fire.) One reading of the draft per frame
// drives the flame's body, its shader and the candle's light together, so
// the light breathes with the flame instead of on a wobble of its own.

// The flame's card, in the candle's own units (the component applies
// CANDLE_SCALE around it). The shader draws the teardrop inside it with
// room to spare for the soft sheath of glow around the body: the body
// itself is 0.58 of the card's width and 0.88 of its height, 1.7 x 4.9 cm
// once scaled — about the 1:3 of a real candle flame, where the first one
// was a squat 1:1.8. The card starts under the wick's tip because a flame
// burns AROUND the top of its wick, which stands in the dark zone at its
// base.
export const FLAME = { width: 0.042, height: 0.08, sink: 0.012 }

// The light burns at the flame's bright heart, about three quarters of the
// way up the card, and the bend carries that point (3/4)² ≈ 0.6 as far as
// the tip. That's how far the light follows the lean, and it's what makes
// the room move with the flame: the shadows sway as it does.
export const LIGHT_LEAN = 0.6

// The candle's light at rest. The room's exposure is tuned against it, so
// the flicker only swings around it (the average over a visit stays within
// 1% of it, measured).
const BASE_INTENSITY = 6.5

// How far the draft pushes the tip, in the candle's units: a few
// millimetres of lean on still air, three times that when the air stirs.
const CALM_LEAN = 0.003
const GUST_LEAN = 0.009
// The fast shiver a gust adds on top of the lean.
const SHIVER = 0.0012

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// Smooth noise in [-1, 1]: three sines at incommensurate rates, so it never
// jumps and never visibly repeats.
const wander = (t, seed) =>
  0.5 * Math.sin(t * 0.71 + seed) + 0.3 * Math.sin(t * 1.37 + seed * 2.1) + 0.2 * Math.sin(t * 2.93 + seed * 3.7)

// Now and then the air in the room stirs, for a few seconds at a time:
// 0 on still air, 1 at the height of a gust.
export const gust = (t) => smoothstep(0.3, 0.75, wander(t * 0.17, 11))

// Everything the flame does at time t (seconds):
// - leanX / leanZ: where the draft has pushed the tip, in the candle's units
// - stretch: the flame's height against FLAME.height — a slow breath, and
//   during a gust a quick flicker over a slightly shorter flame
// - flutter: 0..1, how hard the ripple runs up the flame's body
// - brightness: the shader's glow, tied to the stretch — a taller flame is
//   a hotter one
// - light: the candle's light intensity, on the same stretch
export function flameAt(t) {
  const g = gust(t)
  const reach = CALM_LEAN + GUST_LEAN * g
  const shiver = SHIVER * g
  const stretch = 1 + 0.035 * wander(t * 1.6, 3) + g * (0.045 * Math.sin(t * 10.7) - 0.05)
  return {
    leanX: reach * wander(t * 0.9, 1) + shiver * Math.sin(t * 8.3),
    leanZ: reach * wander(t * 0.8, 4) + shiver * Math.sin(t * 7.1 + 1),
    stretch,
    flutter: 0.15 + 0.85 * g,
    brightness: 1 + (stretch - 1) * 0.8,
    light: BASE_INTENSITY * (1 + (stretch - 1)),
  }
}
