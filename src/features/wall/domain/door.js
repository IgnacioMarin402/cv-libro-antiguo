import { WINDOW_CENTER_X, WINDOW_WALL } from './window'

// The room's door: an arched oak door in a pointed frame, with strap hinges
// and a ring pull, a mesh generated in Tripo like the window and not built
// in code (see components/ArchedDoor.jsx). It's shut, so unlike the window
// it needs no hole in the wall: it stands on it.

// Across the room from the window, on the same axis: in the wall opposite
// it — the south one, behind the resting camera — at the window's own x.
// Measured along its own wall, which runs round the room the other way,
// that's the window's offset turned around.
export const DOOR_WALL = (WINDOW_WALL + 2) % 4
export const DOOR_CENTER_X = -WINDOW_CENTER_X

// The model exports 53.3 wide, 97.8 tall and 12.4 deep, standing on y = 0
// and facing +z. Door-sized, 2.5 m tall: 1.36 m wide, the arch springing
// 1.82 m up and the ring pull 0.91 to 1.15 m, at hand height. Scaled like
// the window, floor to the top of the wall, it stood 3.43 m and was asked
// down to this.
export const DOOR_HEIGHT = 2.5
export const DOOR_MODEL_HEIGHT = 97.77
export const DOOR_SCALE = DOOR_HEIGHT / DOOR_MODEL_HEIGHT

// Where it stands and which way it faces: at its wall, moved DOOR_CENTER_X
// along it, turned with it. The wall's face falls at the model's own z = 0,
// as the window's does. The leaf's face stands 0.08 to 0.5 in front of it —
// 2.0 to 12.8 mm at scale, where the depth buffer resolves 0.2 mm even from
// the far side of the room — the frame 11.5 cm proud and the ring pull 16.
// What's behind (the leaf's back and the far side of its hinges) goes into
// the wall. Over every orbit and aim the lens keeps 26.8 cm from the frame
// (measured with the polar limit).
export function doorPlacement(side) {
  const { position: [x, y, z], rotationY } = side
  return {
    position: [
      x + DOOR_CENTER_X * Math.cos(rotationY),
      y,
      z - DOOR_CENTER_X * Math.sin(rotationY),
    ],
    rotationY,
  }
}
