// The scene's standing lights — everything except the candle, which carries
// its own flickering point light (see the candle feature). Art direction
// kept as data: a warm, dim room where the candle does the real work.

// A low warm fill standing in for bounced candlelight, so shadowed faces
// aren't pure black.
export const AMBIENT = { color: 0x8a734e, intensity: 4.6 }

// Cold light from somewhere behind and to the left — a window, a moon —
// just enough to keep the warm side from reading as the only light source.
export const COLD_FILL = { color: 0x4d5a78, intensity: 0.8, distance: 8, position: [-1.4, 0.9, -1.2] }

// The key: soft, warm, high and off to one side, casting the long shadows
// across the table.
export const KEY = { color: 0xfff0d2, intensity: 1.5, position: [-1, 2.4, 1.6] }
