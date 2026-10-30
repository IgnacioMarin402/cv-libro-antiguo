// Shourdo snapping a cookie out of the air. The bust has no lower jaw to
// open: under the lips the surface runs straight back to the throat —
// measured in sections down the muzzle at x = 0, 5 and 10, it faces down
// from the lips' edge (z = 41, y = 55.5) back to z = 29, where it turns
// down the throat, rising toward the cheeks to y = 57–59. So that underside
// is the jaw: it drops, turning about a hinge across the muzzle behind it,
// and the lips' edge, which stays, stretches into the open mouth between
// them (see shaders/bustMotion).
//
// All in the model's units, like the head's (see domain/head).

// The hinge: a line across the muzzle (along x) at the underside's back,
// where it meets the throat.
export const JAW_HINGE = { y: 57, z: 27.5 }

// How far the jaw drops, wide open: 12°, which takes the front of the
// underside 3 units down (3.5 cm at his size) — a mouth 10 units across
// and 3 to 4 tall between the lips and the jaw, on a render of the face
// with this same share. 14° opened it 4.5 tall, wider than the nose.
export const JAW_ANGLE = (12 * Math.PI) / 180

// Which vertices are the jaw, each by its own share (0..1) of the drop:
// - facing down: none where the surface faces down less than 0.3 (the
//   lips' front, the throat), all of it past 0.6 (the underside);
// - across the muzzle: all of it within 4 units of its middle, x = 5 — the
//   mouth's corners, on the face, are at x = -1.5 and 12.3 — none past
//   7.5, so the corners taper as a mouth's do: at 6 units' falloff they
//   ended square;
// - along it: none behind the hinge, all of it 2.5 units in front, and
//   none from z = 42.5 on, where the nose faces down too;
// - and only from y = 50 to 59: under the nose, and over the chest.
export const JAW_SHARE = {
  facing: [-0.3, -0.6],
  middleX: 5,
  across: [4, 7.5],
  back: [JAW_HINGE.z, JAW_HINGE.z + 2.5],
  front: [41.5, 42.5],
  below: [50, 52],
  above: [59, 60],
}

// The mouth, where the drop stretches the lips' edge: in the shader, the
// surface stretched past 1.4 times its own area starts to darken to the
// inside of a mouth, and past 2.5 it's all mouth. The rest of the jaw only
// turns and keeps its area. The inside is a dark red, sRGB (60, 18, 20),
// and matte.
export const MOUTH_STRETCH = [1.4, 2.5]
export const MOUTH_COLOR = '#3c1214'
export const MOUTH_ROUGHNESS = 0.8

// Where in the open mouth a cookie goes: in the middle of the opening, a
// little inside the lips.
export const MOUTH_TARGET = [5, 54.5, 38]

// A snap: open in 0.12 s, held 0.04, shut in 0.14 — a dog catching
// something thrown, quicker shut than a blink is open. Both ease.
export const SNAP_OPEN = 0.12
const SNAP_HOLD = 0.04
const SNAP_SHUT = 0.14

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// How open his mouth is (0..1), `since` seconds after a snap began.
export function jawOpening(since) {
  if (!(since >= 0)) return 0
  if (since < SNAP_OPEN) return smoothstep(0, SNAP_OPEN, since)
  const closing = since - SNAP_OPEN - SNAP_HOLD
  return 1 - smoothstep(0, SNAP_SHUT, closing)
}
