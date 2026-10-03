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
