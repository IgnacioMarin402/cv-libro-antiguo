// The cauldron beside the fireplace: an iron pot on a bed of firewood, a
// mesh generated in Tripo like the fireplace and not built in code (see
// Cauldron.jsx). A low fire burns under it: the candle's own flame again
// (see features/candle), smaller than the hearth's.

// The model exports 97.8 wide, 73.3 tall and 94 deep, standing on y = 0.
// The firewood lies from the floor up to 7–13, spread out to a radius of
// 46; the pot sits on it, its belly 94 across at its widest (y = 40), its
// underside rounding up from 14 at a radius of 25 to 31 at 45, and its rim
// at 72 (measured by raycasting it).
const MODEL_POT_DIAMETER = 94
const MODEL_FOOT_RADIUS = 46

// 1.5 m across the pot, which stands it 1.17 m tall on its wood and the
// wood 1.47 m across: a witch's cauldron, big enough to bathe in. It was
// 60 cm, a kitchen hearth's, and was asked two and a half times that.
export const CAULDRON_POT_DIAMETER = 1.5
export const CAULDRON_SCALE = CAULDRON_POT_DIAMETER / MODEL_POT_DIAMETER

// How far out from its centre the wood reaches, once scaled: 73 cm.
export const CAULDRON_RADIUS = MODEL_FOOT_RADIUS * CAULDRON_SCALE

// The fire: the whole bed of wood alight, in two rings of twelve all the
// way round under the pot — 19 out, under the belly, and 23 out, between
// them and in front of them, a little shorter so the inner ring shows over
// it. Each stands on top of the wood where it is (found by raycasting down
// under the belly, moved up to 3 in or out where there was none). A knot
// of nine on the side facing the table looked like one corner of the bed
// burning, a ring of six at 31–38 burned at the wood's edge, and rings at
// 25 and 31, then 22 and 28, still looked spread out and were asked closer
// in. It's a trade with the belly, which hides the wood more the nearer
// the middle: over the orbits and aims that see the cauldron, the flames'
// bases show in 31% and 53% of them at 25 and 31, 22% and 43% at 22 and
// 28, and only 8% and 17% here — of the 24, the three on the side facing
// the table show and the rest burn hidden under the pot. Within 16 of
// the centre none would show at all.
//
// `size` is how many times a candle's flame each is, before the pot grew
// (see FLAME_GROWTH): 0.9 to 1.4, 11 to 17 cm tall at 1.5 m, well under the
// hearth's 21 to 40 (see features/fireplace). No light of its own: one more
// point light is paid for by every lit material in the scene.
const INNER = [
  [0, 7.4, 19], [9.5, 10.8, 16.5], [16.5, 11, 9.5], [19, 10.9, 0],
  [16.5, 6.1, -9.5], [8, 9.7, -17.2], [0, 7.3, -19], [-9.5, 10.9, -16.5],
  [-16.5, 10.2, -9.5], [-18.9, 11.5, 1.7], [-16.5, 6.4, 9.5], [-10.9, 7.9, 15.6],
]
const OUTER = [
  [6, 6.8, 22.2], [16.3, 9, 16.3], [22.2, 10.1, 6], [22.2, 11.6, -6],
  [16.3, 11.4, -16.3], [6, 5.3, -22.2], [-6, 6.9, -22.2], [-16.3, 9, -16.3],
  [-22.2, 9.1, -6], [-22.2, 11, 6], [-16.3, 12, 16.3], [-6, 5.4, 22.2],
]
const INNER_SIZES = [1.3, 1.1, 1.4, 1.2, 1.3, 1.1, 1.4, 1.2, 1.3, 1.1, 1.4, 1.2]
const OUTER_SIZES = [1, 0.9, 1.1, 0.9, 1, 1.1, 0.9, 1, 1.1, 0.9, 1, 0.9]
// Each reads the room's draft at its own moment, all within two seconds,
// so one gust leans the whole fire but no two flames flicker as one.
const MODEL_FLAMES = [
  ...INNER.map((at, i) => ({ at, size: INNER_SIZES[i], phase: (i * 7) % 12 / 6 })),
  ...OUTER.map((at, i) => ({ at, size: OUTER_SIZES[i], phase: ((i * 5) % 12 + 0.5) / 6 })),
]

// A candle burns laminar and slow; a fire on wood is restless. So these
// lean on the draft and ripple twice as far as the candle's flame, and go
// through it all half again as fast (see useFlame's sway and pace).
export const CAULDRON_FLAME_SWAY = 2
export const CAULDRON_FLAME_PACE = 1.5

const FLAME_GROWTH = CAULDRON_POT_DIAMETER / 0.6

// Where each flame burns, in metres within the cauldron, and how big.
export const CAULDRON_FLAMES = MODEL_FLAMES.map(({ at, size, phase }) => ({
  position: at.map((v) => v * CAULDRON_SCALE),
  size: size * FLAME_GROWTH,
  phase,
}))
