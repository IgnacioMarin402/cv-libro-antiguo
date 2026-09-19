import { PAGE_WIDTH, PAGE_HEIGHT } from '@/features/pageCurlBook'

// Moving the framing by keyboard, which the visitor gets only while the
// book is open. OrbitControls always looks at one point, so zooming in
// means zooming into THAT point: without this, the lens can only ever dive
// into the middle of the spread. WASD slides the aim across the table
// first, so the corner you want is what you close in on.

// Which physical key pushes which way, keyed by event.code so the four of
// them stay where they sit on the keyboard whatever the layout calls them.
// The pair is [right, forward] in the camera's own ground plane: forward is
// away from the viewer, across the table, which from every angle the orbit
// allows — including straight overhead — reads as "up the page".
export const PAN_KEYS = {
  KeyW: [0, 1],
  KeyS: [0, -1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
}

// How far the aim may roam from the book's centre: the open spread's own
// footprint, measured on the settled pose — x within [-0.333, +0.321], and
// the leaves keep their full height in z. So any corner of the spread can
// be brought to the middle of the frame and nothing past it can, which is
// what keeps the visitor from sliding off the book and losing it.
export const AIM_BOUNDS = { x: PAGE_WIDTH * 0.85, z: PAGE_HEIGHT / 2 }

const clamp = (value, limit) => Math.min(limit, Math.max(-limit, value))

export const clampAim = (x, z) => [clamp(x, AIM_BOUNDS.x), clamp(z, AIM_BOUNDS.z)]

// A held key crosses this much of the frame's OWN height every second,
// rather than a fixed number of metres: the pan then feels the same at
// every zoom, because what the visitor reads is the frame, not the table.
// At the shot the book opens on (1.24 m away, 85 cm of table in frame)
// that is 51 cm/s — the whole spread in 1.3 s. Zoomed all the way in
// (18 cm away, 12 cm in frame) it is 7 cm/s, which is fine positioning.
export const PAN_FRAME_HEIGHTS_PER_SECOND = 0.6

export const panSpeed = (distance, fovDegrees) =>
  PAN_FRAME_HEIGHTS_PER_SECOND * 2 * distance * Math.tan((fovDegrees * Math.PI) / 360)

// Ramp in and out of that speed, so a tap nudges the frame and a held key
// glides it. Short enough that the keys still feel immediate.
export const PAN_SMOOTH_TIME = 0.18
