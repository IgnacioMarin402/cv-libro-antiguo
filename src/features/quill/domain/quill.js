// The quill and its inkwell on the table: one mesh generated in Tripo, like
// the helmet, and not built in code (see Quill.jsx) — a red feather lying
// on the cloth with a gilt nib, and a squat inkwell beside it, red with
// gold lilies.

// The model exports 0.98 wide, 0.36 tall and 0.94 deep, standing on y = 0
// and facing +z, like everything from Tripo. The feather lies corner to
// corner across it, 1.28 from its tip to the nib; the inkwell stands at its
// +x side and is the whole of the height (measured on its vertices).
const MODEL_HALF_WIDTH = 0.49
const MODEL_HALF_DEPTH = 0.468

// Sized by what the two are, there being nothing in the room to fit them
// to: at 0.2 the inkwell stood 7.2 cm and the quill ran 25.5 cm, a goose
// quill's length. Asked 10% bigger, and then 10% again: 8.7 and 30.9 cm.
export const QUILL_SCALE = 0.2 * 1.1 * 1.1

// Half its footprint once scaled, across and deep: 11.9 by 11.3 cm.
export const QUILL_HALF_WIDTH = MODEL_HALF_WIDTH * QUILL_SCALE
export const QUILL_HALF_DEPTH = MODEL_HALF_DEPTH * QUILL_SCALE
