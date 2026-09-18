// The book as a bound object: its spec sheet. Every measurement of the
// physical build, in meters, plus the handful derived from them that the
// rest of the feature reads off. Nothing here knows about React or
// three.js — how the book is *made* lives in geometry/, how it *moves* in
// opening.js and pageStack.js.

export const BOOK = {
  coverW: 0.39,
  coverH: 0.527,
  coverT: 0.0119,
  pagesT: 0.0765,
}

// Height of the closed book's top face — the reference the camera frames
// against (see the camera feature's shots).
export const topSurfaceY = BOOK.coverT + BOOK.pagesT + BOOK.coverT

// How many leaves the text block is bound with. Configurable per
// environment because leaf count is this scene's main performance dial:
// every leaf is a hinged group carrying its own bendable sheet.
export const MAX_PAGES = Math.max(1, Number(import.meta.env.VITE_MAX_PAGES) || 16)

// Half the book's own closed stack height (table to top cover), used to
// center every hinge on the block's vertical middle and to size the spine
// strip that stands there (see geometry/spineGeometry) — without a mesh
// there, the covers' and pages' hinge-side edges sit exposed instead of
// tucked behind it.
export const SPINE_HALF_HEIGHT = (2 * BOOK.coverT + BOOK.pagesT) / 2 + 0.0003

// How far the spine's bridge strip reaches past the hinge line, in
// whichever direction the nearer cover currently points (see
// geometry/spineGeometry's updateSpineBridge). Kept barely there rather
// than given real presence: since the strip already tracks each cover's
// live angle instead of needing enough bulk to physically span the gap
// between them, any more than this reads as its own visible patch filling
// the gutter — exactly what the pages curving out of it are supposed to
// hide.
export const SPINE_DEPTH = 0.0015

// The hinge line every panel shares: covers and page leaves all pivot right
// at the spine's flat hinge face, a hair off the spine group's own origin.
// Keeping it one constant is what guarantees they stay bound to the same
// edge — drifting these apart opens a visible gap at the gutter.
export const HINGE_X = -0.003

// Where the spine's tilting group stands, relative to the book's own
// center: at the left edge of the covers, raised so its strip caps the
// block from top edge to bottom edge.
export const SPINE_ORIGIN = [-BOOK.coverW / 2 + 0.003, SPINE_HALF_HEIGHT, 0]

// A leaf is cut slightly smaller than its boards on both axes — the covers
// of a bound book overhang the text block (the binder's "square"), which is
// what keeps the page edges protected when it's shut.
export const PAGE_WIDTH = BOOK.coverW * 0.985
export const PAGE_HEIGHT = BOOK.coverH * 0.98

// The block's total thickness, divided among its leaves.
export const PAGE_THICKNESS = BOOK.pagesT / MAX_PAGES

// Where each board's hinge sits, measured from the spine group's origin:
// the front board on top of the block, the back one under it.
export const FRONT_COVER_HINGE_Y = BOOK.coverT + BOOK.pagesT - SPINE_HALF_HEIGHT
export const BACK_COVER_HINGE_Y = -SPINE_HALF_HEIGHT
