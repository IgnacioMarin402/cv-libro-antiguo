// A blank comparison book built with the "page-curl" technique from the
// wass08/r3f-animated-book-slider tutorial: each leaf is a boxy sheet
// skinned to a chain of bones along its width, so it curls as it turns
// instead of swinging as a rigid flat card. Kept deliberately plain — flat
// color, no photographs — since the point of this object is to compare
// that BENDING motion against our own book's from-scratch vertex-
// displacement curl (see features/book/geometry/pageSheet.js), not to look
// like a finished prop. The curl's own numbers are the tutorial's; the
// ones about where leaves sit in a pile are ours, because the tutorial's
// book stands upright in the air and this one lies on a table.

// The boards' own cut, which is the whole book's footprint. Matches the
// first book of this scene (features/book, 0.39 x 0.527 covers), so
// swapping one for the other didn't shrink the table, and the camera still
// frames against these two numbers (see features/camera/domain/shots).
export const PAGE_WIDTH = 0.39
export const PAGE_HEIGHT = 0.527
export const PAGE_DEPTH = 0.0024
// Bone count along the width — the curl's resolution. 30 is the tutorial's
// own number; the skinning math elsewhere assumes bones sit at segment
// boundaries (see geometry/pageGeometry.js), so this can't change without
// touching that too.
export const PAGE_SEGMENTS = 30
export const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS
export const PAGE_COUNT = 10

// The square: how far the boards overhang the text block. Every leaf used
// to be the same rectangle, boards included, and measured on the settled
// pose the ten leaves ended on the same head and tail plane to 0.00 mm —
// the board's edge and the paper's edge falling on one line, which no
// binding does. The fore-edge already had a square of its own, 1.8 to
// 16.6 mm, given for free by the stacking lean pulling each hinge back
// toward the spine; but that one only exists while the book is OPEN, and
// closed the block went flush again on all three edges. So the square is
// cut into the paper rather than added to the boards: the book keeps the
// footprint the camera frames against, and gains it in both states.
//
// The spine edge gets none — there the paper is bound flush, which is what
// the hinge line means.
export const SQUARE = 0.004
export const PAPER_WIDTH = PAGE_WIDTH - SQUARE
export const PAPER_HEIGHT = PAGE_HEIGHT - SQUARE * 2
// A shorter leaf on the same 30-bone chain: same curl, smaller sheet.
export const PAPER_SEGMENT_WIDTH = PAPER_WIDTH / PAGE_SEGMENTS

// How the book lies on the table, and the frame every measurement below is
// written in. The tutorial's rig stands its book up (hinge = local Y) and
// swings pages in the local XZ plane; this one lies flat, so the whole rig
// is tilted 90° in Y and 90° in Z, which cycles thickness onto world up and
// the width/height pair onto the horizontal plane without touching any of
// the borrowed per-bone math. The extra half turn is which way the book
// faces: without it the spine ends up on the wrong side and leaves turn
// away from the reader.
//
// What this frame gives the rest of the file: its x is the table's up, and
// its z runs from the spine out to the fore-edge. Change the tilt and
// those two sentences stop being true — with them, every clearance and
// every stacking number here and in domain/pile.js.
export const TILT_ROTATION = [0, Math.PI / 2 + Math.PI, Math.PI / 2]

// Where a leaf sits in the open book, and how it bends there, is
// domain/pile.js.
//
// Closed, every leaf lies flat and the normals all point up, so the
// thickness itself is enough — plus a hair, so no two faces end up coplanar
// and z-fighting.
export const CLOSED_PITCH = PAGE_DEPTH * 1.05

// How high the book's hinge line has to sit for nothing to sink into the
// table (see PageCurlBook's rotation, which turns the stacking axis
// vertical). Closed, the block rests on its bottom leaf, so half a leaf's
// thickness is all it needs. Open, a leaf hangs well below its own hinge:
// the chain arches up at the spine and then rolls its fore-edge down past
// horizontal, and THAT is what sets the height. CURL_DIP is the deepest a
// leaf ever reaches — the bottom leaf of a pile, hinged lowest — measured
// over a full open-and-close cycle, plus a couple of millimetres so it
// clears rather than grazes. The tutorial never has to care; the price of
// lying flat is that the book rides up while it is open.
//
// 16.1 mm, at the front board's landing as the book closes. It was 57.8
// while the leaves fanned 0.8° apart (the tutorial's FAN_STEP) and the
// back board, last of the fan, drooped 5 cm past horizontal; the pile in
// domain/pile.js stacks them without a fan.
const CURL_DIP = 0.0161
const CLEARANCE_MARGIN = 0.0025

// Where the layout stands it: closed, on the table.
export const TABLE_CLEARANCE_Y = PAGE_DEPTH / 2
// And how much higher it rides once it's open.
export const OPEN_LIFT = CURL_DIP + CLEARANCE_MARGIN - TABLE_CLEARANCE_Y

// Height of the closed book's top face: the bottom leaf resting on the
// table, the rest of the block stacked on it. The footprint is the
// BOARDS', PAGE_WIDTH x PAGE_HEIGHT, since the paper is trimmed inside
// them (see SQUARE) and the two boards are what the silhouette is made of.
// The camera frames against both (see features/camera/domain/shots).
export const topSurfaceY = TABLE_CLEARANCE_Y + (PAGE_COUNT - 1) * CLOSED_PITCH + PAGE_DEPTH / 2
// Going up it has to beat the very first turn: the front cover starts
// swinging the moment the book stops being closed, and if the book is
// still low when that leaf lands, its curl goes through the table
// (measured: slowing this down puts it back). Coming down is slower only
// because it looks better — the book settles onto the table instead of
// dropping onto it; the clearance doesn't depend on it.
export const LIFT_SMOOTH_TIME = 0.35
export const LIFT_FALL_SMOOTH_TIME = 1.6

// And once it is up there, it breathes. A raised cosine, so it leaves from
// zero and comes back to zero and is never negative in between: the float
// can only ADD to the clearance the lift already measured out, which is
// what keeps it from ever finding the table again. Time is counted from
// the moment the book opened (see useTableLift), so it always starts at
// the bottom of the breath rather than jumping into the middle of one.
export const LEVITATION_RISE = 0.035
export const LEVITATION_PERIOD = 6

export const levitationRise = (seconds) =>
  (LEVITATION_RISE * (1 - Math.cos((2 * Math.PI * seconds) / LEVITATION_PERIOD))) / 2

// How long a turn's extra mid-flex lasts, in ms — the tutorial's own value.
export const TURN_DURATION = 400

// The tutorial's three per-bone curve coefficients, tuned there by eye:
// how much a bone leans toward the spine (inside, the first third of the
// chain), how much the rest resists that lean (outside), and how much
// every bone flexes extra while a turn is actively in progress (turning).
export const INSIDE_CURVE_STRENGTH = 0.18
export const OUTSIDE_CURVE_STRENGTH = 0.05
export const TURNING_CURVE_STRENGTH = 0.09

// Roughly how long a bone takes to settle onto its target angle, in seconds
// — the "smooth time" of shared/math/easing's smoothDamp, i.e. the
// tutorial's easingFactor / easingFactorFold. Half a second is what makes
// a turn read as a slow, heavy sheet of paper instead of a snap; ROTATION
// is the main curl, FOLD the small secondary crease.
export const ROTATION_SMOOTH_TIME = 0.5
export const FOLD_SMOOTH_TIME = 0.3

// A jump of several sheets doesn't turn as one block: they leave the stack
// one at a time, this many ms apart — closer together when there are more
// of them to get through, so a long jump doesn't crawl.
const STEP_DELAY = 150
const STEP_DELAY_RUSHED = 50
const RUSHED_JUMP = 2

export const turnStepDelay = (sheetsLeft) =>
  Math.abs(sheetsLeft) > RUSHED_JUMP ? STEP_DELAY_RUSHED : STEP_DELAY
