// The wooden floor the table stands on: dark planks from a single tileable
// image, not painted in code (see Floor.jsx). Where it lies is the layout's
// call — at the table's feet.

// How many metres one repeat of the image covers. It holds twelve planks
// across, so at 2 m each comes out about 17 cm wide, the width of an old
// hand-sawn floorboard.
export const FLOOR_TILE_SIZE = 2

// The room has no walls, and the canvas behind everything is black. A floor
// that simply stopped would show its rim against it from the far end of
// the orbit, so it darkens into that black instead: whole out to FADE_START
// around the table, gone by FADE_END. The candle's own light has no cutoff
// but falls off as a true inverse square; the flat ambient is what would otherwise
// keep a far rim lit. Both are the first 2.5 and 6 m scaled by √0.7, to
// take 30% off the floor's area (12 × 12 m down to 10 × 10) and keep the
// room close around the table.
export const FADE_START = 2.1
export const FADE_END = 5

// How far a point sits from the table's centre, as the floor measures it:
// the larger of the two axis offsets, not the straight line. The floor is a
// square, and a fade that went by the straight-line distance would still
// draw a circle on it.
export function floorDistance(x, z) {
  return Math.max(Math.abs(x), Math.abs(z))
}

// How lit the floor's colour is at a distance d from the table's centre:
// 1 inside FADE_START, easing to 0 at FADE_END.
export function floorShade(d) {
  const t = Math.min(Math.max((d - FADE_START) / (FADE_END - FADE_START), 0), 1)
  return 1 - t * t * (3 - 2 * t)
}

// How much relief the bump takes from the image's own brightness — the
// gaps between the planks are darker than the boards, so they sink below
// them.
export const BUMP_SCALE = 2
