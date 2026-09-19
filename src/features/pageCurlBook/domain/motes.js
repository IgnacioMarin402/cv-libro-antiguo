import { rand } from '@/shared/math/random'
import { PAGE_WIDTH, PAGE_HEIGHT } from './pageCurl'

// The motes the book gives off while it is open. They start like the
// room's dust (see features/dust) — positions plus the velocities that
// carry them, recycled once they leave the top — and then stop behaving
// like dust: each one spirals instead of rising straight, each one
// breathes its own light, and the column runs cold, ice blue through
// violet, so nothing about it reads as an ember off the candle.

export const MOTE_COUNT = 140

// They come off the edges too, not only off the paper.
const MARGIN = 0.08
const SPREAD_X = PAGE_WIDTH / 2 + MARGIN
const SPREAD_Z = PAGE_HEIGHT / 2 + MARGIN
// From the block itself up to about a forearm above it, which is as far as
// the candle still picks them out.
const FLOOR_Y = 0
const CEILING_Y = 0.55

// The spiral: how fast a mote wanders sideways and how long one turn takes.
// Its own phase is what keeps the column from moving as one body.
const SWAY_SPEED = 0.022
const SWAY_PERIOD = 5

// The breath of each light: how dim it gets between peaks, and how long a
// peak takes to come round. Fed through the point's own color rather than
// the material's opacity, which is shared by the whole column.
const TWINKLE_FLOOR = 0.45
const TWINKLE_PERIOD = 2.4

// The two ends of the column's palette, mixed per mote. Kept bright: these
// multiply the sprite under additive blending, and against a table this
// warm a cold light has to be nearly white at the core to read at all.
const ICE = [0.78, 0.95, 1.0]
const VIOLET = [0.82, 0.58, 1.0]

export function createMoteField() {
  const positions = new Float32Array(MOTE_COUNT * 3)
  const colors = new Float32Array(MOTE_COUNT * 3)
  const velocities = new Float32Array(MOTE_COUNT * 3)
  const phases = new Float32Array(MOTE_COUNT)
  const tints = new Float32Array(MOTE_COUNT * 3)
  for (let i = 0; i < MOTE_COUNT; i++) {
    positions[i * 3] = rand(-SPREAD_X, SPREAD_X)
    positions[i * 3 + 1] = rand(FLOOR_Y, CEILING_Y)
    positions[i * 3 + 2] = rand(-SPREAD_Z, SPREAD_Z)
    velocities[i * 3] = rand(-0.008, 0.008)
    velocities[i * 3 + 1] = rand(0.03, 0.09)
    velocities[i * 3 + 2] = rand(-0.008, 0.008)
    phases[i] = rand(0, Math.PI * 2)
    const mix = Math.random()
    for (let c = 0; c < 3; c++) tints[i * 3 + c] = ICE[c] + (VIOLET[c] - ICE[c]) * mix
  }
  return { positions, colors, velocities, phases, tints }
}

// Advances the whole column one frame, in place: the rise, the spiral
// around it, and each mote's own flicker. Meters per second, so it drifts
// the same however fast the machine runs. A mote that reaches the top
// drops back to the block somewhere else over it, so the column never
// thins out on one side.
export function driftMotes({ positions, colors, velocities, phases, tints }, seconds, delta) {
  const swayAngle = (Math.PI * 2 * seconds) / SWAY_PERIOD
  const twinkleAngle = (Math.PI * 2 * seconds) / TWINKLE_PERIOD
  for (let i = 0; i < MOTE_COUNT; i++) {
    const phase = phases[i]
    positions[i * 3] += (velocities[i * 3] + SWAY_SPEED * Math.sin(swayAngle + phase)) * delta
    positions[i * 3 + 1] += velocities[i * 3 + 1] * delta
    positions[i * 3 + 2] += (velocities[i * 3 + 2] + SWAY_SPEED * Math.cos(swayAngle + phase)) * delta
    if (positions[i * 3 + 1] > CEILING_Y) {
      positions[i * 3] = rand(-SPREAD_X, SPREAD_X)
      positions[i * 3 + 1] = FLOOR_Y
      positions[i * 3 + 2] = rand(-SPREAD_Z, SPREAD_Z)
    }
    const lit = TWINKLE_FLOOR + (1 - TWINKLE_FLOOR) * (0.5 + 0.5 * Math.sin(twinkleAngle + phase))
    colors[i * 3] = tints[i * 3] * lit
    colors[i * 3 + 1] = tints[i * 3 + 1] * lit
    colors[i * 3 + 2] = tints[i * 3 + 2] * lit
  }
}

// How bright the column gets, and how long it takes to come and go
// (smoothDamp's smooth time) — slower than the book's own lift, so the
// motes gather after it rises and linger a moment after it shuts.
export const MOTE_OPACITY = 0.95
export const MOTE_FADE_SMOOTH_TIME = 1.2
