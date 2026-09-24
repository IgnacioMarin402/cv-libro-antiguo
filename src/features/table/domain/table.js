// The table everything else stands on: an ornate round table under a
// tablecloth, a mesh generated in Tripo like the wizard and not built in
// code (see Table.jsx). Its surface sits at y = 0, so every prop in the
// scene is placed from the table up rather than against an offset.

export const TABLE_SURFACE_Y = 0

// Where the cloth lies, in the GLB's own units (it exports 97.2 wide and
// 45.3 tall, standing on y = 0 and centred on the origin). The cloth is flat
// at 44.9 under every prop — the median over the book's reach, the candle's
// foot, the wizard's and the helmet's all fall between 44.87 and 44.93 —
// and its folds rise at most 0.4 above that, 9 mm at scale. It stays flat
// out to a radius of 44.4, then rolls over the edge and hangs; the 48.6 the
// model measures across is that drape, not the top.
export const MODEL_TOP_Y = 44.9
const MODEL_TOP_RADIUS = 44.4

// Sized so the cloth's flat top is 1 m across, the radius the table has had
// since it was sized against what it holds: the helmet's stand and spikes
// reach 0.88 m out, and from the resting camera the rear edge still sits
// inside the frame. That makes it 1.01 m tall — taller than a table you'd
// write at, but the scene has no floor to read it against, and the height
// can't be what sets the size: at 0.72 m the top would be 0.71 m across and
// the helmet and the wizard would stand off its edge.
export const TABLE_SCALE = 1 / MODEL_TOP_RADIUS

// Lowered so the cloth, not the model's feet, lands on y = 0.
export const TABLE_OFFSET_Y = TABLE_SURFACE_Y - MODEL_TOP_Y * TABLE_SCALE
