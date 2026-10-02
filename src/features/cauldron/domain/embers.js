import { CAULDRON_SCALE } from './cauldron'

// What rises off the cauldron: little glowing orbs that well up out of the
// brew, drift up over the rim swaying as they go, and fade out — appearing
// and vanishing all the time, never the same twice. Drawn in the fire's own
// orange and yellow, as round lit spheres rather than flat specks (see
// shaders/emberShader).

// The brew's surface, in the file's units: it lies at 54.1 in the middle,
// and the pot's mouth opens 41 out at the rim (72). They rise from inside
// 30 of the middle, so none starts against the pot's wall.
const MODEL_SURFACE_Y = 54.1
const MODEL_SPAWN_RADIUS = 30

// About forty in the air at once, enough for a steady stream over a pot
// 1.5 m across without becoming a cloud. Each is a point in one draw call.
export const EMBER_COUNT = 40

export const EMBER_SURFACE_Y = MODEL_SURFACE_Y * CAULDRON_SCALE
const SPAWN_RADIUS = MODEL_SPAWN_RADIUS * CAULDRON_SCALE

// Each lives 2.2 to 4 s and rises 12 to 24 cm a second — so it clears the
// rim, 29 cm over the brew, a second or two in, and dies 30 to 90 cm up.
const LIFE = [2.2, 4]
const RISE = [0.12, 0.24]
// 2 to 4.5 cm across: from the far side of the room, a few pixels, the
// size of a spark.
const SIZE = [0.02, 0.045]
// The sideways drift as it climbs, like warm air carrying it: up to 3.5 cm
// either way, swinging once every 4 to 8 s.
const SWAY = 0.035
const SWAY_RATE = [0.8, 1.6]

// It fades in over its first fifth and out over its last half: it seems to
// kindle out of the brew and burn away in the air.
const FADE_IN = 0.2
const FADE_OUT_FROM = 0.5

// The fire's colours, from the flame's own palette (see
// features/candle/shaders/flameShader): each orb sits somewhere between
// the flame's orange and its yellow, and its heart burns toward white.
export const EMBER_ORANGE = [1.0, 0.42, 0.08]
export const EMBER_YELLOW = [1.0, 0.7, 0.28]
export const EMBER_HOT = [1.0, 0.95, 0.82]

const pick = (random, [a, b]) => a + random() * (b - a)
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// A new orb, born on the brew somewhere inside SPAWN_RADIUS. `hue` is 0 for
// the flame's orange, 1 for its yellow.
export function spawnEmber(random = Math.random) {
  const r = SPAWN_RADIUS * Math.sqrt(random())
  const a = random() * Math.PI * 2
  return {
    x: r * Math.cos(a),
    z: r * Math.sin(a),
    life: pick(random, LIFE),
    rise: pick(random, RISE),
    size: pick(random, SIZE),
    hue: random(),
    swayRate: pick(random, SWAY_RATE),
    swayPhase: random() * Math.PI * 2,
  }
}

// Where an orb is `age` seconds after it was born, and how much of it shows
// (0..1). Past its life it's gone, and the hook spawns a new one.
export function emberAt(ember, age) {
  const t = age / ember.life
  return {
    x: ember.x + SWAY * Math.sin(age * ember.swayRate + ember.swayPhase),
    y: EMBER_SURFACE_Y + ember.rise * age,
    z: ember.z + SWAY * Math.cos(age * ember.swayRate * 0.7 + ember.swayPhase),
    alpha: smoothstep(0, FADE_IN, t) * (1 - smoothstep(FADE_OUT_FROM, 1, t)),
  }
}
