// The rug under the table: a woven rug with a lion and a dragon on it, a
// mesh generated in Tripo like the table and not built in code (see
// Rug.jsx) — but not laid as it comes. The model carves its figures in
// relief, and their heads stand up off it like sculpture, so it's pressed
// flat on load (see geometry/flattenRug).

// The model exports 97.8 long, 71.8 wide and 9.7 tall, lying on y = 0 with
// its long side along x. The bare field between the figures tops out at
// 3.85 (its weave runs from 2.7 to there), the border at 5.3, the figures'
// bodies at 4 to 6 and their heads at 9.68 (measured over its vertices).
const MODEL_WIDTH = 71.84
const MODEL_PILE_TOP = 3.85
const MODEL_RELIEF_TOP = 9.68

// Sized first so the thrones round the table stood on it whole, with 12 cm
// of rug past the farthest corner of each (they reach 1.48 m out along both
// axes, measured over their meshes): 3.2 m across. Then asked 30% bigger:
// 4.16 m across and 5.67 m long, 60 cm past the thrones. Its edges stop
// 50 cm short of the fireplace's hearth, 51 cm of the cauldron's foot and
// 43 cm of the antique table's top, so nothing else in the room stands on
// it (measured over their meshes where they meet the floor).
const RUG_WIDTH = 1.3 * 3.2
export const RUG_SCALE = RUG_WIDTH / MODEL_WIDTH

// Scaled whole, the field would stand 22 cm thick and the heads 56 cm. It's
// pressed to a rug's own thickness, 1 cm, and everything carved over the
// field — border, bodies and heads alike — into the 2 mm above it, so the
// figures read as woven in rather than standing on it.
const PILE_THICKNESS = 0.01
const RELIEF_HEIGHT = 0.002

// How much each band of the model's height is pressed: the field's, and
// the relief's over it.
const PILE_SQUASH = PILE_THICKNESS / (MODEL_PILE_TOP * RUG_SCALE)
const RELIEF_SQUASH = RELIEF_HEIGHT / ((MODEL_RELIEF_TOP - MODEL_PILE_TOP) * RUG_SCALE)

// How much the model's height is pressed at y — what a normal there has to
// be tilted by to follow the surface down.
export function rugSquashAt(y) {
  return y <= MODEL_PILE_TOP ? PILE_SQUASH : RELIEF_SQUASH
}

// Where the model's height y lands, still in its own units, once pressed.
// It only ever squeezes, and keeps the order, so a head's top stays over
// its own underside and over the field under it.
export function flattenRugHeight(y) {
  if (y <= MODEL_PILE_TOP) return y * PILE_SQUASH
  return MODEL_PILE_TOP * PILE_SQUASH + (y - MODEL_PILE_TOP) * RELIEF_SQUASH
}
