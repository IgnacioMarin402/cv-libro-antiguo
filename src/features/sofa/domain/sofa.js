// The cushion nook: a seat on the floor of rugs piled one on another, big
// cushions leant along its back, a throw, an open book and a stack of
// books with a jar on top — a mesh generated in Tripo like the shield, and
// not built in code (see Sofa.jsx).
//
// It came at 1.9 million triangles, twenty times any other model in the
// room, and was asked simplified: the file is cut to 199 thousand with
// gltfpack (-si 0.105, on top of scripts/pack-glb.mjs's own flags). Against
// the full mesh, lit and raked, it measured 51.7 dB from 3.9 m — about the
// distance it's seen from across the table — 43.3 from 2 m and 38.5 from
// under 1 m, closer than the lens ever gets (at 20%, 380 thousand: 53.9,
// 45.5 and 40.4); up close the throw's knit is a little softer, nothing
// else.

// The model exports 0.977 wide, 0.364 tall and 0.981 deep, standing on
// y = 0 and facing +z: the cushions along its back, at -z, the book stack
// at its front on the -x side. Its rearmost point is at z = -0.491, and its
// sides reach x = ±0.488, the model centred across.
const MODEL_WIDTH = 0.9768
const MODEL_BACK_Z = -0.4906
const MODEL_SIDE_X = 0.4884

// 1.73 m across, which makes the big cushions 59 cm wide and their tops
// 64 cm off the floor, and the books in the stack 27 cm. It was 1.5 m and
// was asked 15% bigger.
export const SOFA_WIDTH = 1.5 * 1.15
export const SOFA_SCALE = SOFA_WIDTH / MODEL_WIDTH

// How far the model's origin stands, once scaled, from the wall at its
// back, and from whatever either of its sides faces.
export const SOFA_BACK_OFFSET = -MODEL_BACK_Z * SOFA_SCALE
export const SOFA_SIDE_OFFSET = MODEL_SIDE_X * SOFA_SCALE
