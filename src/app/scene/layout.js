import { FLAME_Y } from '@/features/candle'
import { TABLE_CLEARANCE_Y } from '@/features/pageCurlBook'
import { TABLE_FOOT_Y } from '@/features/table'

// Where each prop stands on the table. The book holds the origin — it's what
// the scene is about and what the camera frames against — and everything
// else is placed around it.

// Due north of the book, clear of its far edge — the light now comes from
// behind it rather than raking across the cover.
const CANDLE_X = 0
const CANDLE_Z = -0.45

// The candlestick stands on the table on its own foot, and the fire's
// ambience is anchored at the flame on its wick, so the crackle comes from
// where the light visibly does.
export const CANDLE_POSITION = [CANDLE_X, 0, CANDLE_Z]
export const FLAME_POSITION = [CANDLE_X, FLAME_Y, CANDLE_Z]

// The book itself holds the origin — it is what the scene is about and
// what the camera frames against. Lifted just enough that it rests on the
// table on its bottom leaf (see TABLE_CLEARANCE_Y).
export const BOOK_POSITION = [0, TABLE_CLEARANCE_Y, 0]

// West of the book, across from the helmet, turned to face it. What sets
// the spot is its staff clip, which thrusts straight ahead at the book,
// since it faces it — 35 cm at the wizard's size, the tip 17 cm off the
// table — against everything the book sweeps over a whole visit with its
// levitation (out to 39.3 cm left of the spine mid-turn). It stood at
// (-0.7, -0.3) when it was 39 cm tall; grown to 58 cm there, the staff
// went 0.2 cm into the leaves. So it stands on that same line, 82 cm out
// instead of 76: the staff stops 3.5 cm short, and the figure keeps
// 15.7 cm standing and 17.3 cm waving; its feet reach 85 cm from the book,
// inside the cloth's flat top (1 m). Along the line, 88 cm out keeps
// 9.2 cm but puts the feet 9 cm from the edge, 85 cm keeps 6.0 — it stood
// there first and was asked closer — and 80 cm only 1.7. The fixed shots
// cut it from above wherever it stands at this size — here they take in
// 32% of the figure at rest and 68% open.
export const WIZARD_POSITION = [-0.754, 0, -0.323]
// Facing the book's origin — the spine, and the middle of the open spread.
export const WIZARD_ROTATION = [
  0,
  Math.atan2(BOOK_POSITION[0] - WIZARD_POSITION[0], BOOK_POSITION[2] - WIZARD_POSITION[2]),
  0,
]

// East of the book, where the wizard's mirror image stood before it grew and
// moved: 0.76 m from the book, turned to face it the same way — its face is
// +z as exported, like the wizard's. It stayed put rather than follow the
// wizard. Nothing of it moves, so the only reach to clear is the book's: on
// this side the book goes out to 39.3 cm right of the spine over a whole
// visit, and the helmet keeps 24.2 cm from it at its nearest (measured with
// the book's levitation).
export const HELMET_POSITION = [0.7, 0, -0.3]
export const HELMET_ROTATION = [
  0,
  Math.atan2(BOOK_POSITION[0] - HELMET_POSITION[0], BOOK_POSITION[2] - HELMET_POSITION[2]),
  0,
]

// Under the table, where its feet stand, centred on it like everything else.
export const FLOOR_POSITION = [0, TABLE_FOOT_Y, 0]

// The walls stand on that same floor, around the same centre.
export const WALL_POSITION = FLOOR_POSITION
