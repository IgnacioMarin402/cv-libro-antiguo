// A blank comparison book built with the "page-curl" technique from the
// wass08/r3f-animated-book-slider tutorial: each leaf is a boxy sheet
// skinned to a chain of bones along its width, so it curls as it turns
// instead of swinging as a rigid flat card. Kept deliberately plain — flat
// color, no photographs — since the point of this object is to compare
// that BENDING motion against our own book's from-scratch vertex-
// displacement curl (see features/book/geometry/pageSheet.js), not to look
// like a finished prop.

export const PAGE_WIDTH = 0.32
export const PAGE_HEIGHT = 0.43
export const PAGE_DEPTH = 0.003
// Bone count along the width — the curl's resolution. 30 is the tutorial's
// own number; the skinning math elsewhere assumes bones sit at segment
// boundaries (see geometry/pageGeometry.js), so this can't change without
// touching that too.
export const PAGE_SEGMENTS = 30
export const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS
export const PAGE_COUNT = 10

// How long a turn's extra mid-flex lasts, in ms — the tutorial's own value.
export const TURN_DURATION = 400

// The tutorial's three per-bone curve coefficients, tuned there by eye:
// how much a bone leans toward the spine (inside, the first third of the
// chain), how much the rest resists that lean (outside), and how much
// every bone flexes extra while a turn is actively in progress (turning).
export const INSIDE_CURVE_STRENGTH = 0.18
export const OUTSIDE_CURVE_STRENGTH = 0.05
export const TURNING_CURVE_STRENGTH = 0.09

// Damping rates for THREE.MathUtils.damp — how fast each bone's rotation
// chases its target, in 1/s. Higher = snappier. Starting points to tune by
// eye; ROTATION is the main curl, FOLD the small secondary crease.
export const ROTATION_DAMPING = 12
export const FOLD_DAMPING = 8
