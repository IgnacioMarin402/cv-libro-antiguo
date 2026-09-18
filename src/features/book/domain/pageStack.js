import { BOOK, PAGE_THICKNESS } from './binding'

// Where leaf i belongs. A leaf lives in one of two piles — the unread stack
// on the right, the read pile on the left — and this module owns the rules
// for both, as plain functions of the leaf's index.

// How much to exaggerate a settled leaf's lift off of whatever it's piled
// on, beyond its own physical thickness. Enough spacing to read as a
// distinct sheet without opening a visible gap at the gutter.
export const STACK_LIFT_SCALE = 1.5

// The topmost leaves lift slightly as the cover opens (falling off fast
// with depth), so the flat stack meets the curved spine with a soft edge
// instead of a hard corner. Leaf i's max tilt is REST_TILT_BASE *
// REST_TILT_FALLOFF^i.
export const REST_TILT_BASE = 0.22
export const REST_TILT_FALLOFF = 0.35

// Flat (unread, right-hand stack): leaf i keeps its original slot, i = 0
// topmost, right under the front cover.
export const unreadLeafY = (i) => BOOK.coverT + BOOK.pagesT - (i + 1) * PAGE_THICKNESS

// Flipped (read, left-hand stack): leaves land on top of the front cover's
// own live surface, not at the hinge line — leaf i stacks i leaf-thicknesses
// above leaf 0, same as a real pile (see coverShelfY). Read as an arc length
// at the leaf's own hinge (see usePageFlip, which turns it into a small
// extra opening angle rather than a straight-line offset — sliding the
// leaf itself away from the hinge would float it clear of the spine
// bridge). STACK_LIFT_SCALE only pads the *base* clearance off the cover
// itself, not the per-leaf spacing above it — it must stay an additive
// offset, not a multiplier, or every leaf ends up STACK_LIFT_SCALE
// thicknesses from its neighbor instead of one, fanning the whole pile
// out. The pad is needed because at the cover's own steep resting angle, a
// single true leaf thickness of separation projects to only a couple of
// screen pixels from a normal viewing distance — not enough to read as "on
// top of the cover" rather than fused with it.
export const readPileOffset = (i) => (i + STACK_LIFT_SCALE) * PAGE_THICKNESS

// The extra lift the topmost resting leaves get as the cover opens.
export const restTilt = (i) => REST_TILT_BASE * Math.pow(REST_TILT_FALLOFF, i)
