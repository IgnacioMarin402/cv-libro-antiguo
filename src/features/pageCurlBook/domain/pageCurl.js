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

// The boards' own cut, which is the whole book's footprint: this binding
// has no boards overhanging its text block, every leaf is the same
// rectangle. Matches the first book of this scene (features/book, 0.39 x
// 0.527 covers), so swapping one for the other didn't shrink the table.
export const PAGE_WIDTH = 0.39
export const PAGE_HEIGHT = 0.527
export const PAGE_DEPTH = 0.003
// Bone count along the width — the curl's resolution. 30 is the tutorial's
// own number; the skinning math elsewhere assumes bones sit at segment
// boundaries (see geometry/pageGeometry.js), so this can't change without
// touching that too.
export const PAGE_SEGMENTS = 30
export const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS
export const PAGE_COUNT = 10

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
// every stacking number here.
export const TILT_ROTATION = [0, Math.PI / 2 + Math.PI, Math.PI / 2]

// WHERE A LEAF SITS IN ITS PILE.
//
// The tutorial offsets each leaf along its own local z and lets its 0.8°
// fan do the rest. That cannot keep leaves apart here: a leaf's normal
// swings 99° between the spine and the fore-edge, so any single offset
// direction stops separating somewhere along the way. Measured on the
// settled pose, the tutorial's direction collapses to 0.0mm in the MIDDLE
// of the page (leaves 3mm thick) — which is why the cover showed through
// the leaf lying on it. Straight up collapses at the spine instead.
//
// The best compromise direction leans STACK_LEAN off vertical, back toward
// the spine, and never keeps less than ~52% of the pitch as real
// separation (found by scanning every direction against the whole chain).
// So an open pile needs a pitch of about twice the leaf thickness; closed,
// where every leaf lies flat and the normals all point up, the thickness
// itself is enough — plus a hair, so no two faces end up coplanar and
// z-fighting.
export const STACK_LEAN = (27.5 * Math.PI) / 180
export const OPEN_PITCH = PAGE_DEPTH * 2
export const CLOSED_PITCH = PAGE_DEPTH * 1.05

// A leaf's offset from the bottom of its own pile, as [up, towardSpine] in
// the book's tilted frame (see PageCurlBook: its x is the table's up and
// its z runs from spine to fore-edge). Both piles rest on the table and
// grow upward — the turned one from the front cover, the unturned one from
// the back — so a leaf that turns travels from the top of one pile to the
// top of the other, which for the front cover is the whole block. Pure
// function of the reading state, symmetric across the spine by
// construction: neither side can behave differently from the other.
export const stackOffset = (number, page) => {
  const closedBook = page === 0 || page === PAGE_COUNT
  const opened = page > number
  const depth = opened ? number : PAGE_COUNT - 1 - number
  const pitch = closedBook ? CLOSED_PITCH : OPEN_PITCH
  const lean = closedBook ? 0 : STACK_LEAN
  return [depth * pitch * Math.cos(lean), depth * pitch * Math.sin(lean) * (opened ? -1 : 1)]
}

// How fast a leaf glides to its new height, in seconds (smoothDamp's
// smooth time). Close to the turn itself, so the leaf settles onto its
// pile as it lands rather than after.
export const STACK_SMOOTH_TIME = 0.55

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
const CURL_DIP = 0.0578
const CLEARANCE_MARGIN = 0.0025

// Where the layout stands it: closed, on the table.
export const TABLE_CLEARANCE_Y = PAGE_DEPTH / 2
// And how much higher it rides once it's open.
export const OPEN_LIFT = CURL_DIP + CLEARANCE_MARGIN - TABLE_CLEARANCE_Y

// Height of the closed book's top face: the bottom leaf resting on the
// table, the rest of the block stacked on it. This book has no boards
// overhanging its text block — every leaf is the same cut, covers
// included — so its footprint is PAGE_WIDTH x PAGE_HEIGHT flat. The camera
// frames against both (see features/camera/domain/shots).
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

// Each sheet comes to rest a notch further round than the one below it, so
// the turned half fans out ABOVE the cover instead of every leaf collapsing
// into the same plane — which is also what keeps two leaves that opened
// together from z-fighting. Only applies while the book is open: a closed
// book stacks its sheets flat. The tutorial's 0.8° per sheet.
export const FAN_STEP = (0.8 * Math.PI) / 180

// A jump of several sheets doesn't turn as one block: they leave the stack
// one at a time, this many ms apart — closer together when there are more
// of them to get through, so a long jump doesn't crawl.
const STEP_DELAY = 150
const STEP_DELAY_RUSHED = 50
const RUSHED_JUMP = 2

export const turnStepDelay = (sheetsLeft) =>
  Math.abs(sheetsLeft) > RUSHED_JUMP ? STEP_DELAY_RUSHED : STEP_DELAY
