// The head turning slowly from side to side while the figure stands, as
// if its attention drifted. A turn about the vertical, not a tilt: the hat
// is tall, and a tilt swings its tip 6.8 mm per degree at full size, where
// a turn moves the snout 2.8 mm and the tip 2.1.
export const HEAD = 'head'

// At most 3° to either side: the snout goes 8.4 mm each way at full size,
// 3.4 mm in the scene. It was 1.5° first, and asked to show more.
export const HEAD_SWAY = (3 * Math.PI) / 180

// Two slow swings laid together, 5.5 s and 8.5 s, so it never settles into
// a pendulum's beat nor into step with the breath (4 s). Their weights add
// up to one, so the sum stays within the sway. They were 11 s and 17 s
// first, and asked to go twice as fast.
const SWINGS = [
  { period: 5.5, weight: 0.7 },
  { period: 8.5, weight: 0.3 },
]

// Where the head is turned at a time in seconds, from -1 to 1.
export function headSway(t) {
  return SWINGS.reduce((sum, { period, weight }) => sum + weight * Math.sin((2 * Math.PI * t) / period), 0)
}
