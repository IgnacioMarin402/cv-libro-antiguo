import { CANVAS, FRAME, PORTRAIT_SCALE, PX_PER_UNIT, imageToCanvas } from './portrait'

// The four dogs' names, which show themselves to whoever comes to look at
// the portrait up close (see features/camera): each written in light over
// its own dog, in gilt like the frame, one after another in reading order.
// Nothing of them is there until the camera has come; they go when it
// leaves.
//
// Everything here is in the frame model's units, which the portrait's
// scale turns into the room's: a metre on the wall is METRE of them.
const METRE = 1 / PORTRAIT_SCALE

// Where each name goes, picked on the image (1024 px, y down): centred over
// its dog's head, on the line its letters stand on. The top two have the
// dark ground above their dogs to themselves — Alex's skull tops out at
// y 180, Pedro's at 222. The bottom two stand in the band between the top
// dogs' chins and their own heads, over Alex's and Pedro's chests, the only
// ground there is: Gordo's head tops out at 450 and Isidora's at 565
// between her ears, whose tips reach 458 and 528.
const NAMES_ON_IMAGE = [
  { text: 'Alex', x: 300, baseline: 160 },
  { text: 'Pedro', x: 720, baseline: 205 },
  { text: 'Gordo', x: 430, baseline: 434 },
  { text: 'Isidora', x: 715, baseline: 505 },
]

// The lettering's size, 58 px of the image: 5.8 cm on the wall. Cinzel
// Decorative's capitals stand 0.86 of that and its small capitals 0.70 —
// 4.1 cm, 35 px on a 1080p screen from where the camera stops in front of
// it. The widest name, Isidora, runs 26.5 cm, inside the 30 cm between her
// ears' tips.
const NAME_SIZE_PX = 58
export const NAME_SIZE = NAME_SIZE_PX / PX_PER_UNIT

// How high the letters stand over their line, as a share of that size: the
// small capitals that are most of every name, 0.70, and a hair. The gilt's
// gradient runs up to there, and that's the band sparks fly from.
export const LETTER_HEAD = 0.72

// Where on the canvas each name stands: the middle of its line, and the
// line itself.
export const DOG_NAMES = NAMES_ON_IMAGE.map(({ text, x, baseline }) => {
  const [cx, cy] = imageToCanvas(x, baseline)
  return { text, x: cx, baseline: cy }
})

// 1.5 cm in front of the painting: off its surface, and well inside the
// frame's depth (its rails stand 4.6 cm out), so from the front nothing of
// the frame crosses them.
export const NAME_Z = CANVAS.z + 0.015 * METRE

// They write themselves — and the way back appears beside the frame (see
// hooks/useLensSquare) — once the lens stands square in front of the
// painting: within 3 cm of the line out of its middle, and within 2° of
// looking straight down it. With the camera easing in, that comes as it
// settles — measured, a third of a second before it stops. It's read off
// the camera rather than timed from the click, so the names never have to
// know how long the camera takes.
export const SQUARE_OFFSET = 0.03 * METRE
export const SQUARE_ANGLE = (2 * Math.PI) / 180
export const FRAME_MIDDLE_Y = (FRAME.bottom + FRAME.top) / 2

// In reading order, one starting every 0.45 s, written at 25 cm a second
// along the line: Alex in 0.62 s, Isidora in 1.06; all four are done 2.4 s
// after the first begins.
export const WRITE_STAGGER = 0.45
const WRITE_SPEED = 0.25 * METRE

// How far along its line name `index` has been written, `since` seconds
// after the first one began. Below zero it hasn't started; it runs on past
// the name's end, so the light it leaves cools on the last letter too.
export const writtenTo = (since, index) => (since - index * WRITE_STAGGER) * WRITE_SPEED

// The writing's front: soft over 1.5 cm, leaning forward at the top the way
// a quill stroke does, and leaving its light still hot over the last 6 cm
// before it cools into gilt.
export const FRONT_SOFTNESS = 0.015 * METRE
export const FRONT_SLANT = 0.35
export const COOLING = 0.06 * METRE

// When the visitor leaves they all go out at once, quicker than they came
// (smoothDamp's smooth time, in seconds).
export const FADE_OUT_TIME = 0.2

// Their colours, as the screen shows them (not lit, not tone mapped, like
// the cauldron's orbs): gilt, deep at the foot of the letters and pale at
// their head; the near-white of the writing light; and the warm gold of the
// halo they throw on the painting.
export const GILT_DEEP = [0.78, 0.5, 0.18]
export const GILT_PALE = [1.0, 0.9, 0.62]
export const WRITING_LIGHT = [1.0, 0.97, 0.88]
export const HALO = [1.0, 0.72, 0.32]

// How much halo: at rest, while the writing light is on a letter, and the
// tight bloom that rounds the letters' edges.
export const HALO_REST = 0.45
export const HALO_HOT = 1.4
export const HALO_BLOOM = 0.4

// Once written they're alive, not printed: a glint runs across each one
// every 5.5 s, taking 1.3 s to cross — a 4 cm band, brightening the gilt by
// up to 80% — and their halo breathes ±12% every 3.6 s. Each name keeps
// its own phase, so no two glint together.
export const SHIMMER = { period: 5.5, sweep: 1.3, width: 0.04 * METRE, gain: 0.8 }
export const BREATH = { period: 3.6, depth: 0.12 }
export const namePhase = (index) => index * 1.7

// Sparks thrown off the writing, and a few drifting up off the names once
// they're written: 70 a second from a front, 4 a second over all four at
// rest. A spark lives 0.6 to 1.4 s, rising 1.5 to 4.5 cm a second and
// wandering up to 1.2 cm a second sideways.
export const SPARK_COUNT = 96
export const SPARKS_WRITING = 70
export const SPARKS_RESTING = 4
const SPARK_LIFE = [0.6, 1.4]
const SPARK_RISE = [0.015 * METRE, 0.045 * METRE]
const SPARK_DRIFT = 0.012 * METRE

// Drawn 7 mm across, a point of light (pointsMaterial's size, in metres),
// in the writing light's colour, twinkling at its own pace.
export const SPARK_SIZE = 0.007
export const SPARK_COLOR = [1.0, 0.86, 0.55]

const pick = (random, [a, b]) => a + random() * (b - a)
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// A spark born at (x, y, z), in the frame's units.
export function spawnSpark(x, y, z, random = Math.random) {
  return {
    x,
    y,
    z,
    life: pick(random, SPARK_LIFE),
    rise: pick(random, SPARK_RISE),
    drift: (random() * 2 - 1) * SPARK_DRIFT,
    twinkle: pick(random, [7, 13]),
    phase: random() * Math.PI * 2,
  }
}

// Where a spark is `age` seconds after its birth, and how bright (0..1). It
// flares in over its first tenth and dies out over its second half.
export function sparkAt(spark, age) {
  const t = age / spark.life
  const twinkle = 0.65 + 0.35 * Math.sin(age * spark.twinkle + spark.phase)
  return {
    x: spark.x + spark.drift * age,
    y: spark.y + spark.rise * age,
    z: spark.z,
    light: smoothstep(0, 0.1, t) * (1 - smoothstep(0.5, 1, t)) * twinkle,
  }
}
