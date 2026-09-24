// The stone floor the table stands on: flagstones from a single tileable
// image, not painted in code (see Floor.jsx). Where it lies is the layout's
// call — at the table's feet.

// How many metres one repeat of the image covers. It holds about five
// slabs across, so at 2 m they come out 30–50 cm, the size of a laid
// flagstone next to a table 1 m across.
export const FLOOR_TILE_SIZE = 2

// The room has no walls, and the canvas behind everything is black. A floor
// that simply stopped would show its rim against it from the far end of
// the orbit, so it darkens into that black instead: whole out to FADE_START
// around the table, gone by FADE_END. The candle's own light reaches 9 m
// but is faint well before this; the flat ambient is what would otherwise
// keep a far rim lit.
export const FADE_START = 2.5
export const FADE_END = 6

// How lit the floor's colour is at a distance r from the table's centre:
// 1 inside FADE_START, easing to 0 at FADE_END.
export function floorShade(r) {
  const t = Math.min(Math.max((r - FADE_START) / (FADE_END - FADE_START), 0), 1)
  return 1 - t * t * (3 - 2 * t)
}

// How much relief the bump takes from the image's own brightness — the
// slabs are lighter than the mortar between them, so they stand proud of it.
export const BUMP_SCALE = 2
