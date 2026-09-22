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

// The book itself holds the origin — it is what the scene is about and
// what the camera frames against. Lifted just enough that it rests on the
// table on its bottom leaf (see TABLE_CLEARANCE_Y).
export const BOOK_POSITION = [0, TABLE_CLEARANCE_Y, 0]

// West of the book, across from the helmet, turned to face it. What sets
// the spot is its staff clip, which thrusts 23.4 cm straight ahead at about
// 11 cm off the table — at the book, since it faces it — against the
// farthest the book reaches on this side: a leaf in mid-turn sweeps out to
// 39.3 cm left of the spine (both measured, the book over a whole visit
// with its levitation). Here the staff stops 8.3 cm short of that at full
// reach, and the figure keeps 16.6 cm standing and 17.7 cm waving; 5 cm
// nearer the staff keeps 3.4 cm, and at (-0.6, -0.3), where it stood at
// 29 cm tall, it goes 1.3 cm into the leaves. Set back level with the
// book's far edge rather than its middle, which keeps it as far into the
// resting shot as it gets at this size — that shot still cuts its hat, and
// a strip of its left side even on a 2:1 screen (see WIZARD_SCALE).
export const WIZARD_POSITION = [-0.7, 0, -0.3]
// Facing the book's origin — the spine, and the middle of the open spread.
export const WIZARD_ROTATION = [
  0,
  Math.atan2(BOOK_POSITION[0] - WIZARD_POSITION[0], BOOK_POSITION[2] - WIZARD_POSITION[2]),
  0,
]

// East of the book, the wizard's mirror image across the spine: as far out,
// as far back, and turned to face the book the same way — its face is +z
// as exported, like the wizard's. Nothing of it moves, so the only reach
// to clear is the book's: on this side the book goes out to 39.3 cm right
// of the spine over a whole visit, and the helmet keeps 24.2 cm from it at
// its nearest (measured with the book's levitation).
export const HELMET_POSITION = [-WIZARD_POSITION[0], 0, WIZARD_POSITION[2]]
export const HELMET_ROTATION = [
  0,
  Math.atan2(BOOK_POSITION[0] - HELMET_POSITION[0], BOOK_POSITION[2] - HELMET_POSITION[2]),
  0,
]
