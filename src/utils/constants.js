export const BOOK = {
  coverW: 0.46,
  coverH: 0.62,
  coverT: 0.014,
  pagesT: 0.09,
}

export const topSurfaceY = BOOK.coverT + BOOK.pagesT + BOOK.coverT

// Front cover's resting angle once opened: just past vertical (90°) so it
// leans back like a propped-open hardcover instead of lying perfectly flat,
// which would require the hinge to also drop to table height.
export const OPEN_ANGLE = Math.PI * 0.92

// The back cover + resting pages hinge open too, by a smaller angle, so the
// whole book lifts into a "V" propped on its spine instead of the front
// cover swinging away from an inert, table-glued rest of the book.
export const BACK_OPEN_ANGLE = Math.PI * 0.16

// The spine leans left by this much as the book opens, in sync with the
// covers. Closed, its flat hinge face stands upright (90° from horizontal);
// open, it settles at 90° minus this, i.e. ~54° — partway toward lying on
// its rounded side rather than staying rigidly vertical while everything
// around it opens.
export const SPINE_TILT_ANGLE = Math.PI * 0.2
