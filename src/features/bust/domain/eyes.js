// Shourdo blinking. The bust has no eyelids and no bones: his eyes are
// paint, amber with a dark pupil, on the face's surface. The wizard's way —
// squashing each eye's patch of surface onto a line — wants the mesh fine
// there, and these eyes hold 55 and 63 vertices against the wizard's 210:
// squashed, they'd close in facets. So the lid is drawn instead, pixel by
// pixel, in the colour of the fur round the eye, coming down over the paint
// (see shaders/bustMotion).

// Each eye's opening — to the dark rim round the iris, corner to corner —
// in the model's units: its middle on the surface, the way it faces (the
// surface's mean normal over it) and its half-width and half-height across
// it, square to that. His right eye faces 16° to his right and 18° down,
// his left 22° to his left and 11° down, with the curve of the face.
// Measured on a front render of the face at 30 px to the unit, the rim
// traced on crops at 0.5-unit steps, and the frame and the sizes taken off
// the surface under it.
export const EYES = [
  { centre: [-2.68, 73.92, 32.65], normal: [-0.268, -0.313, 0.911], halfWidth: 1.98, halfHeight: 1.8 },
  { centre: [11.62, 74.92, 32.3], normal: [0.365, -0.194, 0.911], halfWidth: 2.18, halfHeight: 1.69 },
]

// Only the eye's own surface is lidded: within 1.5 units of its plane. Over
// the opening the surface stays within 0.62 of it, and the back of the
// head, behind it along the same line, is left alone.
export const EYE_DEPTH = 1.5

// The lid is the black fur round the eye: sRGB (28, 25, 21), the median
// over a ring 1.15 to 1.6 times the opening, the tan brows and the white
// blaze left out. And as rough as that fur, 0.67 in the model's roughness
// map, where the eyes are glossy, 0.04 and 0.11.
export const LID_COLOR = '#1c1915'
export const LID_ROUGHNESS = 0.67

// The lid reaches 10% past the opening all round, and its outline softens
// over its last quarter, so that shut it melts into the fur round it — a
// flat lid with a sharp outline read as a dark disc — and the softened
// band lies on that fur, not on the iris: reaching only to the opening,
// a sliver of amber showed at the bottom of his left eye, shut. (Both
// tried on a render of the face, with the same maths as the shader.)
export const LID_REACH = 1.1
export const RIM_SOFTNESS = 0.25

// Where it's shut, the eye also stops being an eye to the light: its
// glossiness goes (see LID_ROUGHNESS) and so does the relief of iris and
// pupil in the model's normal map, which drew the eye back on the shut lid
// in a lit render. That reaches further than the colour, 10% past the lid's
// own outline: in the softened band the wet rim under the eye still shone.
export const DRY_REACH = 1.1

// Nor is the lid flat: it's streaked like the fur, in fine strands running
// across it, 20 to the half-height, from 0.6 to 1.3 times the fur's colour.
export const FUR_STRANDS = 20

// The lid's edge darkens over the last eighth of the eye's height, where
// the lashes are.
export const LASH_WIDTH = 0.12

// When he blinks: at the wizard's pace, which was asked sparser — every 5
// to 7 s, each 6 s slot with one blink somewhere in its first second — but
// never with the wizard: his slots are scattered from another seed.
const SLOT = 6
const JITTER = 1

// A blink closes in 80 ms and opens in 140, like the wizard's: the lid
// drops faster than it lifts. Both ease, so it doesn't snap.
const CLOSE = 0.08
const OPEN = 0.14

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// A fixed scatter for each slot's offset, the same on every run.
const scatter = (k) => {
  const s = Math.sin(k * 269.5 + 183.3) * 43758.5453
  return s - Math.floor(s)
}

// How shut his eyes are at a time in seconds, from 0 (open) to 1 (shut).
export function blink(t) {
  const k = Math.floor(t / SLOT)
  const since = t - (k * SLOT + scatter(k) * JITTER)
  if (since < 0 || since > CLOSE + OPEN) return 0
  return since < CLOSE ? smoothstep(0, CLOSE, since) : 1 - smoothstep(CLOSE, CLOSE + OPEN, since)
}
