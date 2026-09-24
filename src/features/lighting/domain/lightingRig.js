// The scene's standing lights — everything except the candle, which carries
// its own flickering point light (see the candle feature). Art direction
// kept as data: a dark room where the candle is the only real light.
//
// A light that doesn't fall off with distance lands on the far walls as
// fully as on the book. At 4.6 the ambient, with a directional key (1.5)
// beside it, put 24% of the book's light on the back wall and 26% on the
// floor 3 m out, 85% of it theirs: the room read as lit, not as
// candlelit. The key is gone and the ambient is down to what keeps a
// shadowed face from going pure black; the falloff is the candle's now
// (measured: 6% of the book's light on the back wall, 5% on the floor at
// 3 m). What brightens the table is TABLE_GLOW, which is cut off before
// the room.

// A low warm fill standing in for bounced candlelight, so shadowed faces
// aren't pure black.
export const AMBIENT = { color: 0x8a734e, intensity: 1.0 }

// Cold light from somewhere behind and to the left — a window, a moon —
// just enough to keep the warm side from reading as the only light source.
export const COLD_FILL = { color: 0x4d5a78, intensity: 0.8, distance: 8, position: [-1.4, 0.9, -1.2] }

// The candle's glow pooling over the table, as light bounces off the cloth
// and the things on it — without that bounce, the candle's inverse square
// left the cloth's near half (the cross and quarters toward the viewer) at
// 15% of the book's light, too dark to read the cloth's colours by. It
// hangs over the table's centre with no falloff but its cutoff, so it lies
// nearly even across the cloth, and the cutoff stops it short of the room:
// the floor starts 2.5 m from it and the walls 4.5, past its 2.3 m. The
// candle's own colour (its LIGHT_COLOR, see features/candle/domain/flame),
// since it's the candle's light bounced. At 3.6 it doubled the cloth's
// near half, and was asked brighter still. Measured at 5.4: the near half
// up 2.3x (to 27–29% of the book's light) and the front rim 2.7x (17%),
// the book up 27%, the floor and walls unchanged. When the candle's colour
// was made whiter it came down to 4.8, by the same 0.89 as the candle, so
// it gives the same light. No shadow: it's bounce, not a source.
export const TABLE_GLOW = { color: 0xffbd89, intensity: 4.8, distance: 2.3, decay: 0, position: [0, 1.5, 0] }
