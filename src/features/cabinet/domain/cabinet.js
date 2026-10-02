import { REPEAT_LENGTH } from '@/features/wall'

// The cabinet against the wall: a carved low cupboard with ornaments on its
// top, a mesh generated in Tripo like the bookshelf and not built in code
// (see Cabinet.jsx).

// The model exports 97.4 wide, 77.7 tall and 15.6 deep, standing on y = 0
// and facing +z. Its top is at 68.6, and what stands over that is the
// ornaments on it. Its back is flat at z = -6.4 from the floor to the top
// (measured by raycasting it); only the plinth and the top's cornice stand
// out past it, by up to 1.4, and go into the wall.
const MODEL_WIDTH = 97.4
const MODEL_BACK_Z = -6.4

// Sized like the bookshelf, by the panelling, and as wide: three bays of
// it, column to column, 2.8 m. That stands its top 1.97 m off the floor
// (2.23 m to the tallest ornament) and makes it 41 cm deep. At two bays
// (1.87 m, 1.32 m tall) it looked small beside the bookshelf.
export const CABINET_WIDTH = REPEAT_LENGTH
export const CABINET_SCALE = CABINET_WIDTH / MODEL_WIDTH

// How far the model's origin stands, once scaled, from the wall its back is
// pushed against.
export const CABINET_BACK_OFFSET = -MODEL_BACK_Z * CABINET_SCALE
