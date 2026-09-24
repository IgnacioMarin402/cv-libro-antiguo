import { REPEAT_LENGTH } from '@/features/wall'

// The bookshelf in a corner of the room: a mesh generated in Tripo, like the
// table, and not built in code (see Bookshelf.jsx). A cabinet with doors,
// five shelves of books over it in three bays, and a few ornaments standing
// on its top.

// The model exports 97.3 wide, 87.3 tall and 20.1 deep, standing on y = 0
// and facing +z. Its carcass is narrower than that and isn't centred: the
// sides stand at x = -46.8 and 44.1 and the back at z = -6.4 (measured by
// raycasting it). Only the plinth, the lower cabinet's back and the top's
// cornice stand out past them, by up to 3.7.
const MODEL_BACK_Z = -6.4
const MODEL_RIGHT_X = 44.1
const MODEL_LEFT_X = -46.8

// Sized so its sides span one repeat of the panelling — three bays, 2.8 m,
// column to column from the corner. That stands its top 2.29 m off the
// floor (2.69 m to the tallest ornament), the shelves 30 cm apart with
// books 23 cm tall on them, and the carcass 33 cm deep.
export const BOOKSHELF_SCALE = REPEAT_LENGTH / (MODEL_RIGHT_X - MODEL_LEFT_X)

// How far the model's origin stands, once scaled, from the two walls it's
// pushed into — its back against one, its right side against the other.
// It's the carcass that meets them; what stands out past it goes into the
// walls — 11 cm at most into the back one, 14 cm (the cornice's end) into
// the side one — and doesn't show from the room.
export const BOOKSHELF_BACK_OFFSET = -MODEL_BACK_Z * BOOKSHELF_SCALE
export const BOOKSHELF_SIDE_OFFSET = MODEL_RIGHT_X * BOOKSHELF_SCALE
