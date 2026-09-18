import { BOOK } from './binding'

// How the book opens: the angles its three moving parts settle at, as pure
// functions of reading state (is it open, how many leaves have been turned).
// The components animate *toward* whatever these return — nothing here
// knows about time, easing or frames.

// A cover's hinge rotation runs from 0° (closed, lying flat on top of the
// pages) to 180° (fully open, lying flat on the far side) — so "65° back
// from fully flat" lands at 180° - 65° = 115° on that scale. Both covers
// share this same resting angle once they're the one bearing the weight:
// the front cover swings up to it as soon as the book opens and holds it
// there; the back cover starts flat, pinned under the full stack, and rises
// to the same angle only as that weight is read away.
export const COVER_MAX_ANGLE = Math.PI - Math.PI * (65 / 180)

// The spine leans left by this much as the book opens, in sync with the
// covers. Closed, its flat hinge face stands upright (90° from horizontal);
// open, it settles at 90° minus this, i.e. ~54° — partway toward lying on
// its rounded side rather than staying rigidly vertical while everything
// around it opens.
export const SPINE_TILT_ANGLE = Math.PI * 0.2

// The front cover leads: it swings to the resting angle the moment the book
// is opened and stays there, bearing the read pile from then on.
export const frontCoverAngle = (open) => (open ? COVER_MAX_ANGLE : 0)

// The back cover stays flat, pinned under the full unread stack, until
// pages start moving off of it onto the front cover — then it rises toward
// the same resting angle in step with how much of that stack has been read
// away, reaching it only once every page has turned.
export const backCoverAngle = (open, pagesTurned, totalPages) =>
  open ? COVER_MAX_ANGLE * (pagesTurned / totalPages) : 0

// The spine rocks on the same trigger as the covers, so it visibly moves
// with them rather than after them.
export const spineTiltAngle = (open) => (open ? SPINE_TILT_ANGLE : 0)

// Height of the front cover's far edge at a given opening angle — the shelf
// the read pile stacks up from. A function of the live angle, not a fixed
// number, because that cover keeps lowering as more pages are turned, and
// the pile has to keep riding it down (see pageStack).
export const coverShelfY = (angle) => BOOK.coverT + BOOK.pagesT + BOOK.coverW * Math.sin(angle)
