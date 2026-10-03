// Shourdo's bust: the black, white and tan dog of the portrait, on his own,
// head and shoulders in a purple cape over blue robes, standing on the
// floor — a mesh generated in Tripo like the shield, and not built in code
// (see Bust.jsx).

// The model exports 97.6 wide, 84.7 tall and 93.4 deep, standing on y = 0
// and facing +z. The head runs from the top of the skull, 84.7, down to the
// chin at about 55, and the nose comes out to z = 46.7 in front; the cape
// flares out over the floor behind him, its hem's rearmost point at
// z = -46.7 (measured over its vertices and in a slice down its middle).
//
// As exported, the bottom of his clothes was washed out toward white — below
// y = 19 every colour lost saturation and gained brightness toward the
// floor, down to the hem's tips. The file's colour map is repainted there:
// per colour of cloth (the purple cape, the blue robe, the gold trim, the
// reds), each band of height is brought to the cloth's own hue, saturation
// and brightness above the fade, keeping the folds.
const MODEL_HEIGHT = 84.68
const MODEL_WIDTH = 97.64
const MODEL_BACK_Z = -46.68

// 1 m tall, twice life-size for a medium dog, his head 35 cm from the top
// of the skull to the chin; it was half that, life-size, and was asked
// twice as big. The whole is 1.15 m across the cape's hem and 1.1 m deep,
// nose to hem.
export const BUST_HEIGHT = 1
export const BUST_SCALE = BUST_HEIGHT / MODEL_HEIGHT
export const BUST_WIDTH = MODEL_WIDTH * BUST_SCALE

// How far the model's origin stands, once scaled, from the wall it's set
// against — the back of the hem on it.
export const BUST_BACK_OFFSET = -MODEL_BACK_Z * BUST_SCALE
