// The figure blinking. The GLB has no eyelids and no bones in the face: the
// eyes are only paint, yellow with a dark pupil, on the head's surface. So
// a blink squashes each eye's patch of surface onto a line, paint and all —
// the yellow shrinks to nothing and the dark fur around it closes over.

// Where the eyes are, in the bind pose (metres at full size, figure facing
// +z). Every yellow vertex on the figure is an eye — 214 on the left, 209 on
// the right, sampled from the texture at each vertex's UV — and they span
// 4.3 to 11.8 cm from the middle and 62.2 to 69.4 cm up, mirrored.
export const EYE_CENTER = [0.08, 0.658]
export const EYE_RADII = [0.04, 0.038]

// The squash is whole over the eye and fades out to nothing at 1.6 times
// its size: up to 71.5 cm, well under the hat's brim (76 cm up), and 2.7 cm
// short of the middle, so each eye closes alone.
const REACH = 1.6

// Only the face: the back of the head sits at the same height and width,
// 10 cm behind the spine, and has to stay put. The eyes' surface is 10.6 to
// 14.8 cm ahead of it; nothing behind 6 cm moves.
const FACE_FROM = 0.06
const FACE_FULL = 0.09

// The line the eye closes onto: 30% of the way up it, since it is the upper
// lid that comes down, most of the way, to meet the lower.
export const LID_LINE = 0.622 + 0.3 * 0.072

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// How much of the squash a point of the bind pose takes, from 0 to 1.
export function eyeWeight(x, y, z) {
  const dx = (Math.abs(x) - EYE_CENTER[0]) / EYE_RADII[0]
  const dy = (y - EYE_CENTER[1]) / EYE_RADII[1]
  return (1 - smoothstep(1, REACH, Math.hypot(dx, dy))) * smoothstep(FACE_FROM, FACE_FULL, z)
}

// When it blinks: every 5 to 7 s, never on the beat — each 6 s slot has
// one blink, somewhere in its first second, so from one to the next is
// anywhere from 5 to 7 s. It was every 1.6 to 4.4 s first, and asked to
// be sparser.
const SLOT = 6
const JITTER = 1

// A blink closes in 80 ms and opens in 140: the lid drops faster than it
// lifts. Both ease, so it doesn't snap.
const CLOSE = 0.08
const OPEN = 0.14

// A fixed scatter for each slot's offset, the same on every run.
const scatter = (k) => {
  const s = Math.sin(k * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

// How shut the eyes are at a time in seconds, from 0 (open) to 1 (shut).
export function blink(t) {
  const k = Math.floor(t / SLOT)
  const since = t - (k * SLOT + scatter(k) * JITTER)
  if (since < 0 || since > CLOSE + OPEN) return 0
  return since < CLOSE ? smoothstep(0, CLOSE, since) : 1 - smoothstep(CLOSE, CLOSE + OPEN, since)
}
