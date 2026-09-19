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
