export const BOOK = {
  coverW: 0.46,
  coverH: 0.62,
  coverT: 0.014,
  pagesT: 0.09,
}

export const topSurfaceY = BOOK.coverT + BOOK.pagesT + BOOK.coverT

// A cover's hinge rotation runs from 0° (closed, lying flat on top of the
// pages) to 180° (fully open, lying flat on the far side) — so "65° back
// from fully flat" lands at 180° - 65° = 115° on that scale. Both covers
// share this same resting angle once they're the one bearing the weight
// (see Book): the front cover swings up to it as soon as the book opens
// and holds it there; the back cover starts flat, pinned under the full
// stack, and rises to the same angle only as that weight is read away.
export const COVER_MAX_ANGLE = Math.PI - Math.PI * (65 / 180)

// The spine leans left by this much as the book opens, in sync with the
// covers. Closed, its flat hinge face stands upright (90° from horizontal);
// open, it settles at 90° minus this, i.e. ~54° — partway toward lying on
// its rounded side rather than staying rigidly vertical while everything
// around it opens.
export const SPINE_TILT_ANGLE = Math.PI * 0.2
