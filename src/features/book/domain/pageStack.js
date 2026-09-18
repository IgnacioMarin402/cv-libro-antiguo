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
// above leaf 0, same as a real pile (see coverShelfY). STACK_LIFT_SCALE only
// pads the *base* clearance off the cover itself, not the per-leaf spacing
// above it — it must stay an additive offset, not a multiplier, or every
// leaf ends up STACK_LIFT_SCALE thicknesses from its neighbor instead of
// one, fanning the whole pile out. The pad is needed because at the cover's
// own steep resting angle, a single true leaf thickness of separation along
// the face normal projects to only a couple of screen pixels from a normal
// viewing distance — not enough to read as "on top of the cover" rather
// than fused with it.
export const readPileOffset = (i) => (i + STACK_LIFT_SCALE) * PAGE_THICKNESS

// The extra lift the topmost resting leaves get as the cover opens.
export const restTilt = (i) => REST_TILT_BASE * Math.pow(REST_TILT_FALLOFF, i)

// A leaf's local hinge-thickness axis (perpendicular to its own flat face)
// mapped into world space at opening angle `angle` — i.e. the direction a
// stack of leaves piles up along, not the direction they sweep open in.
// At angle 0 this points straight up (+Y); as the leaf opens it rotates
// like everything else. Used to lift a settled leaf off of whatever it's
// resting on *along its face*, rather than straight up in world Y, which
// only approximates the right direction while that face is still close to
// horizontal.
export function faceNormal(angle) {
  return { x: Math.sin(angle), y: -Math.cos(angle) }
}
