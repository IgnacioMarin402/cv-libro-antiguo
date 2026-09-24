// The figure breathing while it stands. The standing clip is held on one
// pose (see STANDING_POSE), and all the life it has at rest is this: the
// shoulders coming up with each breath, the chin with them, and the belly
// swelling.

// One breath every 4 s — 15 a minute, someone calm at rest. The inhale
// takes the first 40% of it, the exhale the rest: breathing out is the
// slower half. Both ease in and out, so it rests a moment at each end.
export const BREATH_PERIOD = 4
const INHALE = 0.4

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// How full the lungs are at a time in seconds, from 0 (out) to 1 (in).
export function breath(t) {
  const phase = (t / BREATH_PERIOD) % 1
  return phase < INHALE ? smoothstep(0, INHALE, phase) : 1 - smoothstep(INHALE, 1, phase)
}

// The shoulders: each clavicle turns up by this at the height of the
// breath, and the upper arm turns back by as much, so the arm rides up
// with the shoulder instead of swinging out. At full size that lifts both
// shoulders and hands 7.1 mm (2.9 mm in the scene) and leaves the head
// where it was — measured on the skinned mesh. It was 3° first (4.3 mm),
// and asked for more: it barely showed. Leaning the spine back was
// tried first and read as leaning, not breathing: the big head went back
// 4.8 mm for 1° a vertebra, and the chest went in.
export const CLAVICLES = ['clavicle_l', 'clavicle_r']
export const UPPER_ARMS = ['upperarm_l', 'upperarm_r']
export const SHOULDER_RISE = (5 * Math.PI) / 180

// The chin comes up a little on the inhale, turning at the neck. The head
// is big for the body: 1° lifts the snout 3.8 mm at full size, about half
// what the shoulders rise, so the head goes with the breath without
// nodding. It rose from 0.6° with the shoulders.
export const NECK = 'neck_01'
export const CHIN_LIFT = (1 * Math.PI) / 180

// The belly swells with the inhale and goes back down with the exhale. No
// bone owns it — its front is skinned half to the pelvis, half to spine_02
// — so it is a shape of its own over the mesh: a dome, pushed straight
// ahead, in the GLB's bind pose (metres at full size, figure facing +z).
// The bind pose puts the belly's front at 10–11 cm ahead of the spine,
// from 29 to 46 cm up: the dome is centred there, and fades out to nothing
// 10 cm to either side and 9 cm up and down. The closest the forearms come
// in the standing pose is 19 mm from it, at its edge, where it doesn't move.
export const BELLY_CENTER = [0, 0.375]
export const BELLY_RADII = [0.1, 0.09]

// Only the front swells: from nothing at the sides (4 cm ahead of the
// spine) to all of it on the belly's face (8 cm ahead). The back and the
// flanks stay put.
const FRONT_FROM = 0.04
const FRONT_FULL = 0.08

// How far the middle of the belly comes forward at the height of the
// breath: 1 cm at full size, 4 mm in the scene — a bit more than the
// shoulders rise, as the belly is where a calm breath shows most.
export const BELLY_SWELL = 0.01

// How much of the swell a point of the bind pose takes, from 0 to 1.
export function bellyWeight(x, y, z) {
  const dx = (x - BELLY_CENTER[0]) / BELLY_RADII[0]
  const dy = (y - BELLY_CENTER[1]) / BELLY_RADII[1]
  const dome = 1 - smoothstep(0, 1, Math.hypot(dx, dy))
  return dome * smoothstep(FRONT_FROM, FRONT_FULL, z)
}
