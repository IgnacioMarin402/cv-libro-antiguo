import { rand } from '@/shared/math/random'

// The motes drifting through the candlelight. A flat array of positions and
// the constant velocities that carry them: no forces, no collisions —
// specks caught in a warm updraft, recycled to the floor once they leave
// the top of the volume.

// Sparse and slow, the way dust actually hangs in a still room: you notice
// a few specks crossing the light, not a swarm. This is also the scene's
// cheapest performance dial.
export const DUST_COUNT = 65

// The box the motes live in, sized to the lit part of the table rather than
// the whole scene — dust is only worth simulating where it catches light.
const SPREAD = 1.4
const FLOOR_Y = 0.02
const CEILING_Y = 1.6
// A little above the ceiling, so a mote fades past the top of the volume
// before it's recycled instead of popping out at the exact spawn limit.
const RECYCLE_Y = 1.7

export function createDustField() {
  const positions = new Float32Array(DUST_COUNT * 3)
  const velocities = new Float32Array(DUST_COUNT * 3)
  for (let i = 0; i < DUST_COUNT; i++) {
    positions[i * 3] = rand(-SPREAD, SPREAD)
    positions[i * 3 + 1] = rand(FLOOR_Y, CEILING_Y)
    positions[i * 3 + 2] = rand(-SPREAD, SPREAD)
    velocities[i * 3] = rand(-0.006, 0.006)
    velocities[i * 3 + 1] = rand(0.012, 0.04)
    velocities[i * 3 + 2] = rand(-0.006, 0.006)
  }
  return { positions, velocities }
}

// Advances every mote one frame, in place. Velocities are meters per
// SECOND, not per frame: a mote takes a minute or so to cross the volume,
// which is what reads as dust hanging rather than dust blowing, and it
// drifts the same however fast the machine runs.
export function driftDust(positions, velocities, delta) {
  for (let i = 0; i < DUST_COUNT; i++) {
    positions[i * 3] += velocities[i * 3] * delta
    positions[i * 3 + 1] += velocities[i * 3 + 1] * delta
    positions[i * 3 + 2] += velocities[i * 3 + 2] * delta
    if (positions[i * 3 + 1] > RECYCLE_Y) positions[i * 3 + 1] = FLOOR_Y
  }
}
