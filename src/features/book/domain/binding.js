// The book as a bound object: its spec sheet. Every measurement of the
// physical build, in meters, plus the handful derived from them that the
// rest of the feature reads off. Nothing here knows about React or
// three.js — how the book is *made* lives in geometry/, how it *moves* in
// opening.js and pageStack.js.

export const BOOK = {
  coverW: 0.46,
  coverH: 0.62,
  coverT: 0.014,
  pagesT: 0.09,
}

// Height of the closed book's top face — the reference the camera frames
// against (see the camera feature's shots).
export const topSurfaceY = BOOK.coverT + BOOK.pagesT + BOOK.coverT

// How many leaves the text block is bound with. Configurable per
// environment because leaf count is this scene's main performance dial:
// every leaf is a hinged group carrying its own bendable sheet.
export const MAX_PAGES = Math.max(1, Number(import.meta.env.VITE_MAX_PAGES) || 16)

// Radius of the book's spine curve, used to position the covers' and
// pages' hinges. Also rendered as the rounded spine cap itself (see
// geometry/spineGeometry) — without a mesh there, the covers' and pages'
// hinge-side edges sit exposed instead of tucked behind it.
export const SPINE_RADIUS = (2 * BOOK.coverT + BOOK.pagesT) / 2 + 0.0003

// How far the spine's half-ellipse sticks out sideways, as a fraction of
// its own height. A true half-circle (1) sticks out as far as the book is
// thick, which reads as a fat, rounded spine rather than a gentle curve.
export const SPINE_BULGE = 0.4

// The hinge line every panel shares: covers and page leaves all pivot right
// at the spine's flat hinge face, a hair off the spine group's own origin.
// Keeping it one constant is what guarantees they stay bound to the same
// edge — drifting these apart opens a visible gap at the gutter.
export const HINGE_X = -0.003

// Where the spine's tilting group stands, relative to the book's own
// center: at the left edge of the covers, raised so its rounded cap caps
// the block from top edge to bottom edge.
export const SPINE_ORIGIN = [-BOOK.coverW / 2 + 0.003, SPINE_RADIUS, 0]

// A leaf is cut slightly smaller than its boards on both axes — the covers
// of a bound book overhang the text block (the binder's "square"), which is
// what keeps the page edges protected when it's shut.
export const PAGE_WIDTH = BOOK.coverW * 0.985
export const PAGE_HEIGHT = BOOK.coverH * 0.98

// The block's total thickness, divided among its leaves.
export const PAGE_THICKNESS = BOOK.pagesT / MAX_PAGES

// Where each board's hinge sits, measured from the spine group's origin:
// the front board on top of the block, the back one under it.
export const FRONT_COVER_HINGE_Y = BOOK.coverT + BOOK.pagesT - SPINE_RADIUS
export const BACK_COVER_HINGE_Y = -SPINE_RADIUS
