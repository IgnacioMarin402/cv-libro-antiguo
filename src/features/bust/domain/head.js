// Shourdo's head moving a little, as a dog's does sitting still and
// watching. The bust is one rigid mesh, with no bones, so the head is
// turned in its vertex shader (see shaders/bustMotion): every vertex is
// turned about a pivot in the neck by its own share of the head's turn.

// The head comes out of the cape's collar along a slanting line, the same
// at every x across the neck: at the back the fur leaves the collar at
// y = 64 (z = -2.5), and in front, under the chin, the throat goes into it
// at y = 52 (z = 22) — measured in sections at x = -7 and 0, coloured by
// the texture. The head turns about the middle of that line, inside the
// neck, at the head's own x: halfway between the eyes.
export const HEAD_PIVOT = [4.4, 58, 9.75]

// Each vertex's share of the turn goes with its height over that line,
// measured square to it (this is the line's normal, in the y–z plane):
// none 4 units under it, all of it 6 over. So the chest and the collar
// stay put — the collar's top at the back takes 0.23 — the throat and the
// cheeks where they go into the collar take 0.35 to 0.5, and from the chin
// up (10.7 over) the head turns whole.
export const HEAD_LINE_NORMAL = [0, 0.898, 0.44]
export const HEAD_SHARE_FROM = -4
export const HEAD_SHARE_TO = 6

const DEG = Math.PI / 180

// A turn from side to side, as far as the wizard's was asked to go: 3°,
// which swings his nose 2.3 cm each way at his size (it's 0.44 m out from
// the pivot). Under it a tilt of the head, 2°, and a nod, 1.5°. Each is two
// slow swings laid together, with weights that add up to one, at periods
// that don't line up with each other nor with the wizard's head (5.5 and
// 8.5 s) — so it never settles into a beat and never moves in step with
// the wizard's.
const MOTIONS = {
  turn: { amplitude: 3 * DEG, swings: [{ period: 6.3, weight: 0.7 }, { period: 10.1, weight: 0.3, phase: 1.3 }] },
  tilt: { amplitude: 2 * DEG, swings: [{ period: 7.7, weight: 0.6, phase: 0.6 }, { period: 12.9, weight: 0.4, phase: 2.1 }] },
  nod: { amplitude: 1.5 * DEG, swings: [{ period: 4.9, weight: 0.5, phase: 2.6 }, { period: 9.3, weight: 0.5 }] },
}

const sway = ({ amplitude, swings }, t) =>
  amplitude * swings.reduce((sum, { period, weight, phase = 0 }) => sum + weight * Math.sin((2 * Math.PI * t) / period + phase), 0)

// The head's pose at a time in seconds, in radians: the nod about x (down
// is positive), the turn about y (to his left is positive), the tilt
// about z.
export function headPose(t) {
  return { nod: sway(MOTIONS.nod, t), turn: sway(MOTIONS.turn, t), tilt: sway(MOTIONS.tilt, t) }
}
