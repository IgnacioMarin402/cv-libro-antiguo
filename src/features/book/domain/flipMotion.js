import { easeInOutCubic, easeOutQuint, easeOutBack } from '@/shared/math/easing'
import { PAGE_WIDTH } from './binding'

// How the book's parts move once a target angle changes: durations, easings
// and the shape of the flex a leaf takes on mid-turn. Where opening.js says
// *where* something ends up, this says how it gets there.

// The covers' (and spine's) full opening swing.
export const OPEN_DURATION = 1600
export const COVER_STYLE = { duration: OPEN_DURATION, ease: easeInOutCubic, lift: 0 }

// Three page-turn "personalities" — duration, easing and how high the page
// arcs above a straight path mid-flip — picked at random per leaf so pages
// don't all turn with the exact same mechanical motion.
export const FLIP_STYLES = [
  { duration: 560, ease: easeInOutCubic, lift: 0.018 },
  { duration: 760, ease: easeOutQuint, lift: 0.055 },
  { duration: 400, ease: easeOutBack, lift: 0.026 },
]

// Closing is uniform: the whole block falls back together at once, so there
// is no per-leaf personality to pick.
export const PAGE_CLOSE_STYLE = { duration: 420, ease: easeInOutCubic, lift: 0 }

export const leafFlipStyle = (flipped) =>
  flipped ? FLIP_STYLES[Math.floor(Math.random() * FLIP_STYLES.length)] : PAGE_CLOSE_STYLE

// The arc a flipping leaf rises through above a straight path: zero at both
// ends of the turn, peaking at its midpoint.
export const arcLift = (style, t) => style.lift * Math.sin(Math.min(1, t) * Math.PI)

// How far a flipping leaf's traveling S-curl bulges, scaled to the page
// size so it reads as paper bending rather than a fixed, size-blind wobble.
export const PAGE_CURL_AMPLITUDE = PAGE_WIDTH * 0.07

// A traveling S-shaped flex along the leaf's length, on top of its
// permanent spine curve — zero at the hinge and fore-edge, peaking mid-turn
// (raw progress t, not the eased angle) so the page visibly bends as it
// moves instead of swinging as a rigid flat card. Returns a curl function
// of position along the leaf (0..1), or null when there's nothing to bend.
export function travelingCurl(amplitude, t) {
  if (amplitude <= 0) return null
  const envelope = Math.sin(Math.PI * t)
  return (u) => -amplitude * envelope * Math.sin(Math.PI * 2 * u)
}
