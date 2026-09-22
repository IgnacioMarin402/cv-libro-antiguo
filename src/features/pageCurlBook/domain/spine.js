import { PAGE_COUNT, PAGE_DEPTH, PAGE_WIDTH, CLOSED_PITCH } from './pageCurl'

// THE SPINE: the leather that covers the fold and runs a way onto both
// boards. This binding had none — the two boards hinged on the same line
// and, once open, plunged to a bare knife edge with the table showing
// through, and the ten leaves' spine ends stacked into a visible lattice
// above it. Measured on the settled open pose, the two board hinges sit
// 0.0 mm apart; closed they are 22.7 mm apart, the thickness of the block.
// So there is nothing between them to see, and that empty wedge is what
// reads as the cover cutting through the pages.
//
// It is a SKIN, not a structural piece: it is glued to the outer face of
// each board for the first SPINE_GRIP of its width, and between the two it
// rounds out by SPINE_BULGE, the way a rounded back does. Nothing else in
// the book moves for it — the piles keep the stacking that was measured in
// pageCurl.js. Splitting the two piles apart by the block's thickness was
// tried first and measured worse everywhere (45.8% of a turn's frames with
// leaves inside each other, against 6.6%): the fold is not made by where
// the hinges are, it is made by the sheets rising out of them.

// How far along each board the leather runs before it leaves it. A real
// binding covers the spine plus a strip of each board, but here the strip
// has to stop short of the cover's tooling: the gilt border is painted
// 4.3% of the width in from the edge (16.8 mm, `o` in features/book's
// giltOrnament), and the first cut — a sixth of the width, 65 mm — hid it
// along with over a third of the two corner plates. 3% (11.7 mm) leaves
// a few millimetres of bare cover between the leather and the gilt.
export const SPINE_GRIP = PAGE_WIDTH * 0.03

// How far the back rounds out past the hinge line, at the middle of the
// strip. Half the block's own thickness is what a rounded back gives, and
// it is what turns the knife edge into a back you can see.
export const SPINE_WIDTH = (PAGE_COUNT - 1) * CLOSED_PITCH + PAGE_DEPTH
export const SPINE_BULGE = SPINE_WIDTH / 2

// The leather sits this far off the board's own face, so the two never
// share a plane and fight for the depth buffer.
export const SPINE_SKIN = 0.0004

// Samples across the strip, from where it leaves the front board, around
// the fold, to where it leaves the back one. Enough that the rounded part
// reads as a curve and not as a crease.
export const SPINE_ROWS = 33

// Where sample i sits, as [alongBoard, bulge]: how far from the hinge along
// whichever board it belongs to, and how far out of the fold it is pushed.
// s is 1 at the two ends (on the boards, no bulge) and 0 at the middle (at
// the hinge, all of it), so the strip leaves each board flush and rounds
// over in between.
export const spineSample = (i) => {
  const t = i / (SPINE_ROWS - 1)
  const s = Math.abs(2 * t - 1)
  return {
    front: t < 0.5,
    along: s * SPINE_GRIP,
    bulge: SPINE_BULGE * Math.sin(Math.PI * t),
  }
}
