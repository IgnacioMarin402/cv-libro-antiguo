// A wrought-iron wall sconce with three candles: a mesh generated in Tripo
// like the candlestick, and not built in code (see Sconce.jsx). The flames
// on its wicks are the candle's own (see features/candle), and so is its
// light.

// The model exports 94.7 wide, 97.9 tall and 54.7 deep, standing on y = 0
// and facing +z: a plate for the wall, and on arms off it three candles —
// one to each side and one out in front. Scaled to 50 cm tall it's 48 cm
// across and stands 27 cm out from the wall, its candles 2.9 cm in radius
// against the table candle's 1.9.
const MODEL_HEIGHT = 97.92
export const SCONCE_HEIGHT = 0.5
export const SCONCE_SCALE = SCONCE_HEIGHT / MODEL_HEIGHT

// The plate's back, what meets the wall: the bulk of the model's rear-most
// vertices lie at z = -25.8 (measured in 0.2 slices). Only the ends of the
// bar that carries the side arms stand out behind it, by up to 1.6 (8 mm),
// and go into the wall.
const MODEL_BACK_Z = -25.8

// How far the model's origin stands, once scaled, from the wall it hangs
// on — its back against it.
export const SCONCE_BACK_OFFSET = -MODEL_BACK_Z * SCONCE_SCALE

// The three wick tips, in the file's units: each is its candle's highest
// point (measured in 0.5 slices) — left, right, front. The wicks are 1.0 in
// radius where they leave the wax, 5 mm at scale: a thicker wick than the
// table candle's 1.9 mm, for a thicker candle.
const WICK_TIPS = [
  [-39.39, 71.32, 1.84],
  [39.24, 72.61, 1.7],
  [0.02, 72.51, 19.89],
]
const WICK_RADIUS = 1.0

// Where each flame burns, and the wick it burns around, in the scene's
// units within the sconce.
export const FLAME_POSITIONS = WICK_TIPS.map((tip) => tip.map((v) => v * SCONCE_SCALE))
export const WICK_RADIUS_IN_SCENE = WICK_RADIUS * SCONCE_SCALE

// One light for the three flames, the candle's light — its colour, its
// intensity, its flicker — carried by the front one, on the sconce's axis
// and 23 cm out from the wall. Three would be three times the brightness:
// the wall behind is already lit 2.1 times as strongly as the cloth right
// under the candle.
//
// Unlike the candle's, it casts no shadow. A point light's shadow renders
// the scene six more times a frame, and there'd be almost nothing to show
// for it: its shadow camera sees nothing nearer than 50 cm — the sconce
// itself and the wall behind it — and past that, the nearest thing to
// cast one is the table's edge, 3 m off, where the light has fallen to
// under 2% of the candle's (1.8% and 1.9% on the book, measured).
export const LIT_FLAME = 2

// Each flame reads the room's draft at its own moment (see
// features/candle/domain/flame), or three flames side by side would lean
// and flicker as one. Under two seconds apart, the same gust reaches all
// three — a gust takes 12 s and more to build — but the flicker over it
// doesn't match.
export const FLAME_PHASES = [0, 0.8, 1.7]
