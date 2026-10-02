// The shield on the wall: a heater shield with weapons crossed behind it, a
// mesh generated in Tripo like the shelf and not built in code (see
// Shield.jsx).

// The model exports 91.6 wide, 97.1 tall and 19.4 deep, facing +z. The
// shield itself runs from its point at y = 0 up to 63 and is 50 across at
// its widest; over it, the crossed weapons spread to 91.6 and rise to the
// top. Its rearmost point, the weapons' backs, is at z = -9.7 (measured by
// raycasting it).
const MODEL_SHIELD_WIDTH = 50
const MODEL_BACK_Z = -9.7

// 60 cm across the shield, a knight's: the whole, weapons and all, 1.1 m
// wide and 1.17 m tall, standing 23 cm out from the wall.
export const SHIELD_SCALE = 0.6 / MODEL_SHIELD_WIDTH
export const SHIELD_WIDTH = 91.6 * SHIELD_SCALE

// Hung with the shield's point 1.35 m off the floor, which puts its middle
// at eye height and the weapons' tops at 2.52 m — up beside the window's
// lights, under the arch.
export const SHIELD_FLOOR_OFFSET = 1.35

// How far the model's origin stands, once scaled, from the wall it hangs
// on — its back against it.
export const SHIELD_BACK_OFFSET = -MODEL_BACK_Z * SHIELD_SCALE
