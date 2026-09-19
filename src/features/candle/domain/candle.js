// How big the whole prop stands in the scene, against its own measurements
// below — one factor for the candlestick and the candle in it, so they
// keep their proportions. Shrunk once the book took the table: at full
// size the candle stood as tall as the book is wide and pulled the eye off
// it. Everything the candle is MADE of scales with this — wax, wick,
// flame, and the height its light burns at — but not the light's reach or
// its brightness, which are world settings: shrinking those would darken
// the room instead of the candle.
export const CANDLE_SCALE = 0.7

// The wax candle's own build, measured from the holder's cup upward, at
// its own scale — the component applies CANDLE_SCALE around it.
export const CANDLE = {
  radius: 0.025,
  height: 0.32,
  wickRadius: 0.004,
  wickHeight: 0.03,
}

// How high the flame burns above the candle's base. Exported because the
// scene anchors the fire's ambience at this height too (see the layout).
export const FLAME_OFFSET_Y = 0.35
