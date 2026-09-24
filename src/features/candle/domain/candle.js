// The candlestick is a model (public/models/candle-holder.glb): holder,
// candle and wick in one mesh, standing on its own origin. At 0.31 the
// wick's tip stands 30.4 cm over the table, where the procedural candle's
// stood (31.9) — and its foot (6.5 cm radius) and candle (1.9 cm) come out
// close to the old ones (7 and 1.75) without being fitted to them.
export const MODEL_SCALE = 0.31

// The wick, in the file's own units (measured from its vertices, in 2 cm
// slices): its tip is the mesh's highest point, 0.98, centred on the axis
// within 3 mm; the wick itself is 6 mm in radius.
const WICK_TIP = 0.98
const WICK_RADIUS = 0.006

// How big the fire stands in the scene, against its own measurements (see
// domain/flame): the flame, its glow and the height its light burns at.
// It's what the whole candle was built at before the candlestick became a
// model, and the flame was tuned at that size. Not the light's reach or
// its brightness, which are world settings: shrinking those would darken
// the room instead of the candle.
export const FLAME_SCALE = 0.7

// Where the flame burns: at the wick's tip, above the candle's base on the
// table. Exported because the scene anchors the fire's ambience there too
// (see the layout).
export const FLAME_Y = WICK_TIP * MODEL_SCALE

// The wick's radius in the flame's units, for bringing the flame's card
// out in front of it (see useFlame).
export const WICK_RADIUS_IN_FLAME = (WICK_RADIUS * MODEL_SCALE) / FLAME_SCALE

// The light burns 3.5 cm over the wick's tip (0.05 in the flame's units),
// as it did over the procedural one. It has to stay clear of the model:
// it casts shadows, and from inside the mesh the candle would shadow the
// whole room.
export const LIGHT_Y = 0.05
