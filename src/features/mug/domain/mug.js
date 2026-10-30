import { FRAMING, LOOK_DOWN } from './beer'

// The dragon tankard on the table: a mesh generated in Tripo, like the
// helmet, and not built in code (see Mug.jsx) — copper, a dragon in relief
// on its front and another coiled into its handle.

// The model exports 0.98 wide with its handle, 0.975 tall and 0.72 deep,
// standing on y = 0 and facing +z — the relief's side — with the handle on
// +x.
const MODEL_HEIGHT = 0.975

// It came in at 15 cm tall, a stein's height, sized by what it is like the
// quill; asked twice that, it stands 30 cm, 30 cm across with its handle
// and 22 cm deep — a tankard for a table this size.
export const MUG_HEIGHT = 0.15 * 2
export const MUG_SCALE = MUG_HEIGHT / MODEL_HEIGHT

// What a click on it lands on: a box round it, handle and all, up to the
// top of the foam it gets (see domain/beer).
export const HIT_BOX = { center: [0, 0.5, 0], size: [0.98, 1, 0.72] }

// What the camera goes to look at when it's clicked (see FOCUS in
// features/camera): the framing (see domain/beer), placed with the tankard
// at `position` turned by `heading` about the vertical, in metres — its
// middle, the way the lens looks back down at it, and its size.
export function mugFocus(position, heading) {
  const [x, y, z] = FRAMING.center.map((v) => v * MUG_SCALE)
  const cos = Math.cos(heading)
  const sin = Math.sin(heading)
  const level = Math.cos(LOOK_DOWN)
  return {
    center: [position[0] + x * cos + z * sin, position[1] + y, position[2] - x * sin + z * cos],
    normal: [level * sin, Math.sin(LOOK_DOWN), level * cos],
    width: FRAMING.size * MUG_SCALE,
    height: FRAMING.size * MUG_SCALE,
  }
}
