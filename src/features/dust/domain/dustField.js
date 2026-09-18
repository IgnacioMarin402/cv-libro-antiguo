import { rand } from '@/shared/math/random'

// The motes drifting through the candlelight. A flat array of positions and
// the constant velocities that carry them: no forces, no collisions —
// specks caught in a warm updraft, recycled to the floor once they leave
// the top of the volume.

export const DUST_COUNT = 260

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
    velocities[i * 3] = rand(-0.004, 0.004)
    velocities[i * 3 + 1] = rand(0.006, 0.02)
    velocities[i * 3 + 2] = rand(-0.004, 0.004)
  }
  return { positions, velocities }
}

// Advances every mote one frame, in place.
export function driftDust(positions, velocities) {
  for (let i = 0; i < DUST_COUNT; i++) {
    positions[i * 3] += velocities[i * 3]
    positions[i * 3 + 1] += velocities[i * 3 + 1]
    positions[i * 3 + 2] += velocities[i * 3 + 2]
    if (positions[i * 3 + 1] > RECYCLE_Y) positions[i * 3 + 1] = FLOOR_Y
  }
}
