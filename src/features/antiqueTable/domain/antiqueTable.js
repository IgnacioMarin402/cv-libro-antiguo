// The antique table by the door: a heavy writing table with parchments,
// a quill and a candle on it, a mesh generated in Tripo like the shelf and
// not built in code (see AntiqueTable.jsx).

// The model exports 98 wide, 71 deep and 64.4 tall, standing on y = 0. Its
// top is at 39.7; what's on it rises to 64.4, all toward its -z side, which
// is its back, the side that goes to the wall. Its top's back edge is at
// z = -35.5 and its widest, the top's ends, ±49 (measured by raycasting it).
const MODEL_TOP_Y = 39.7
const MODEL_BACK_Z = -35.5
const MODEL_HALF_WIDTH = 49

// Sized first by its top, 76 cm off the floor, a writing table's height
// (1.88 m long, 1.36 m deep), then asked half as big again — its top
// 1.14 m off the floor, 2.82 m long and 2.04 m deep, a table for a giant's
// study, like the cauldron's — and then 15% smaller than that (35% was
// tried first and was too much), and then 10% smaller again: its top 87 cm
// off the floor, 2.15 m long and 1.56 m deep, what's on it up to 1.42 m.
export const ANTIQUE_TABLE_SCALE = (0.9 * 0.85 * 1.5 * 0.76) / MODEL_TOP_Y

// How far the model's origin stands, once scaled, from the wall its back
// is pushed toward, and how far its ends reach either side of it.
export const ANTIQUE_TABLE_BACK_OFFSET = -MODEL_BACK_Z * ANTIQUE_TABLE_SCALE
export const ANTIQUE_TABLE_HALF_WIDTH = MODEL_HALF_WIDTH * ANTIQUE_TABLE_SCALE
