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
// quill's length. Asked 10% bigger three times over: 9.6 and 34 cm.
export const QUILL_SCALE = 0.2 * 1.1 * 1.1 * 1.1

// Half its footprint once scaled, across and deep: 13 by 12.5 cm.
export const QUILL_HALF_WIDTH = MODEL_HALF_WIDTH * QUILL_SCALE
export const QUILL_HALF_DEPTH = MODEL_HALF_DEPTH * QUILL_SCALE

// Which way the quill lies in the model, nib to tip — the nib at
// (0.4, 0.467), the tip at (-0.478, -0.458), measured on its vertices — as
// an angle round y from +z, the way the layout turns things. Turning the
// model by r lays the quill at QUILL_HEADING + r.
const NIB = [0.4, 0.467]
const TIP = [-0.478, -0.458]
export const QUILL_HEADING = Math.atan2(TIP[0] - NIB[0], TIP[1] - NIB[1])
