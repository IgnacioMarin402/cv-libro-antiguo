// The wall shelf beside the fireplace: a carved board on two brackets with
// books, jars and candlesticks standing on it, a mesh generated in Tripo
// like the fireplace and not built in code (see Shelf.jsx).

// The model exports 97.4 wide, 51.9 tall and 24.2 deep, facing +z. The
// board's top is at 30.3, the brackets under it reach down to 10, and what
// stands on it rises to 51.9; under one end something hangs down to 0. It
// has no back: what meets the wall is the brackets, whose backs are at
// z = -8.6 (measured by raycasting it). The board's back edge runs on to
// -12.1, and goes 4 cm into the wall once it's hung.
const MODEL_WIDTH = 97.4
const MODEL_BOARD_Y = 30.3
const MODEL_BACK_Z = -8.6

// 2.75 m across, which makes the board 59 cm deep from the wall, the books
// on it about 56 cm tall and the whole 1.47 m from what hangs under it to
// the tallest thing on it. It was 1.1 m, then twice that, and was asked
// 2.5 times bigger again; 5.5 m doesn't fit the 3.15 m of wall between the
// mantel and the corner, so it's 2.5 times the first instead.
export const SHELF_WIDTH = 2.75
export const SHELF_SCALE = SHELF_WIDTH / MODEL_WIDTH

// Hung with the board 1.45 m off the floor: over the panelling's dado rail
// (1.15 m) and under the fireplace's mantel shelf (1.71 m) beside it, at
// the height a shelf to reach things off would be. Its brackets come down
// to 92 cm, what hangs under one end to 59, and what stands on it rises
// to 2.06 m.
const BOARD_HEIGHT = 1.45

// Where the model's origin stands, once scaled: how far out from the wall
// it hangs on, and how far over the floor.
export const SHELF_BACK_OFFSET = -MODEL_BACK_Z * SHELF_SCALE
export const SHELF_FLOOR_OFFSET = BOARD_HEIGHT - MODEL_BOARD_Y * SHELF_SCALE
