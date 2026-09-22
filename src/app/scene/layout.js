import { HOLDER_CUP_Y, FLAME_OFFSET_Y, CANDLE_SCALE } from '@/features/candle'
import { TABLE_CLEARANCE_Y } from '@/features/pageCurlBook'

// Where each prop stands on the table. The book holds the origin — it's what
// the scene is about and what the camera frames against — and everything
// else is placed around it.

// Due north of the book, clear of its far edge — the light now comes from
// behind it rather than raking across the cover.
const CANDLE_X = 0
const CANDLE_Z = -0.45

export const CANDLE_HOLDER_POSITION = [CANDLE_X, 0, CANDLE_Z]
// The candle itself stands in the holder's cup, and the fire's ambience is
// anchored at the flame above it, so the crackle comes from where the light
// visibly does. Both heights are the candle's own measurements, so the
// scene converts them with the scale the prop is built at.
export const CANDLE_POSITION = [CANDLE_X, HOLDER_CUP_Y * CANDLE_SCALE, CANDLE_Z]
export const FLAME_POSITION = [CANDLE_X, (HOLDER_CUP_Y + FLAME_OFFSET_Y) * CANDLE_SCALE, CANDLE_Z]

// Northeast of the book, mirroring the candle's southeast offset — close
// enough to stay in frame at the default camera distance.
export const HELMET_POSITION = [0.5, 0, -0.18]

// The book itself holds the origin — it is what the scene is about and
// what the camera frames against. Lifted just enough that it rests on the
// table on its bottom leaf (see TABLE_CLEARANCE_Y).
export const BOOK_POSITION = [0, TABLE_CLEARANCE_Y, 0]

// West of the book, across from the helmet, turned to face it. What sets
// the spot is its staff clip, which thrusts 17.6 cm straight ahead at 8 cm
// off the table — at the book, since it faces it — against the farthest
// the book reaches on this side: a leaf in mid-turn sweeps out to 39.3 cm
// left of the spine (both measured, the book over a whole visit with its
// levitation). Here the staff stops 4.0 cm short of that at full reach,
// and the figure keeps 10.4 cm standing and 11.1 cm waving. Set back level
// with the book's far edge rather than its middle, because at z = -0.2 the
// figure already crosses the left edge of the resting shot on a 16:9
// screen; here it is inside both framings. Where it first stood,
// (-0.5, -0.2), the staff went 6.2 cm into the leaves.
export const WIZARD_POSITION = [-0.6, 0, -0.3]
// Facing the book's origin — the spine, and the middle of the open spread.
export const WIZARD_ROTATION = [
  0,
  Math.atan2(BOOK_POSITION[0] - WIZARD_POSITION[0], BOOK_POSITION[2] - WIZARD_POSITION[2]),
  0,
]
