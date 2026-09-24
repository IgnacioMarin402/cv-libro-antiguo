import { WALL_HEIGHT } from './wall'

// The one window in the room: a gothic arch in the wall behind the table, a
// mesh generated in Tripo like the table and not built in code (see
// components/GothicWindow.jsx). Its lights are open, not glazed — the
// model has no glass, 55% of its outline is see-through — so whatever lies
// behind the wall shows through them: the night outside (see domain/view).

// Which wall it's in (an index into WALL_SIDES: the north one, which the
// resting camera faces across the table) and where along it, centred
// behind the book and the candle.
export const WINDOW_WALL = 0
export const WINDOW_CENTER_X = 0

// The model exports 51.8 wide, 97.8 tall and 8.2 deep, standing on y = 0
// and facing +z. Scaled so it runs the wall's whole height from the floor,
// like the reference's floor-to-vault window: 1.82 m wide, two bays of the
// panelling, and 29 cm deep, so it stands 14 cm proud of the wall into the
// room — still 19 cm short of the nearest the camera gets (3.86 m on z).
export const WINDOW_MODEL_HEIGHT = 97.82
export const WINDOW_SCALE = WALL_HEIGHT / WINDOW_MODEL_HEIGHT

// The model's outer outline, measured by raycasting it along z: half its
// width at each height, in model units. Upright at ±25 up to the springing
// (71, where the capitals step in), then the pointed arch to its apex.
const OUTLINE = [
  [0, 25], [71, 25], [72.5, 23.4], [74.5, 22.95], [76.5, 22.35], [78.5, 21.6],
  [80.5, 20.65], [82.5, 19.55], [84.5, 18.3], [86.5, 16.85], [88.5, 15.2],
  [90.5, 13.2], [92.5, 10.9], [94.5, 8.1], [96.5, 4.35], [97.82, 0],
]

// The hole cut in the wall for it is that outline pulled in by 2.5 units
// (9 cm): the frame is 5.8 units wide all round, so the hole's edge falls
// halfway across it and is hidden behind it from the front, with no gap
// at the outside edge and no wall showing in the lights.
const HOLE_INSET = 2.5

// Half the hole's width at a height y above the floor, in metres; 0 above
// the apex.
export function openingHalfWidth(y) {
  const u = y / WINDOW_SCALE
  for (let i = 1; i < OUTLINE.length; i++) {
    const [y1, w1] = OUTLINE[i]
    if (u > y1) continue
    const [y0, w0] = OUTLINE[i - 1]
    const w = w0 + ((u - y0) / (y1 - y0)) * (w1 - w0)
    return Math.max(w - HOLE_INSET, 0) * WINDOW_SCALE
  }
  return 0
}

// The heights where the hole's edge bends, in metres, so the wall is cut
// into rows there too and follows the outline exactly.
export const OPENING_BREAKS = OUTLINE.map(([y]) => y * WINDOW_SCALE)

// Where the window stands and which way it faces: at its wall, moved
// WINDOW_CENTER_X along it, turned with it.
export function windowPlacement(side) {
  const { position: [x, y, z], rotationY } = side
  return {
    position: [
      x + WINDOW_CENTER_X * Math.cos(rotationY),
      y,
      z - WINDOW_CENTER_X * Math.sin(rotationY),
    ],
    rotationY,
  }
}
