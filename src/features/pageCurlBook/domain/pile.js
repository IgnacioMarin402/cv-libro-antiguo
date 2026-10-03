import {
  PAGE_COUNT,
  PAGE_SEGMENTS,
  SEGMENT_WIDTH,
  PAPER_SEGMENT_WIDTH,
  CLOSED_PITCH,
  INSIDE_CURVE_STRENGTH,
  OUTSIDE_CURVE_STRENGTH,
} from './pageCurl.js' // with the extension, so scripts/probe.mjs can load it in Node

// THE PILE: how each leaf lies in the open book, and where it is bound.
//
// Paper does not stack as copies of one shape. Every leaf is sewn into the
// spine, and each has to go round the ones under it, so a leaf higher in
// the pile bends wider and, being no longer than the rest, reaches less
// far: an open book's fore-edge steps in leaf by leaf, and every leaf rises
// out of the binding. So here the bottom leaf of each pile — its board —
// takes the tutorial's curl, and every leaf above it is the PARALLEL curve
// of that board, OPEN_PITCH further out per leaf, bound where that offset
// lands on the spine.
//
// It replaces copies of one curl stepped up a 25° lean, 7.5 mm apart, plus
// the tutorial's 0.8° fan. The copies needed that gap to stay apart, and
// it rooted each leaf 6.8 mm higher than the last, in mid-air above the
// spine; it lined every fore-edge up on one slant; and the two piles leaned
// into each other and crossed in the fold. Parallel curves cannot cross, so
// the pitch is down to what the paper's thickness asks for, and the leaves
// need no lift to clear each other mid-turn.
//
// Measured settled (scripts/probe.mjs and a bench built on it): every root
// level on the spine's floor, a pitch apart; each paper leaf's fore-edge
// 5.0 mm short of the one under it, 43.8 mm between the back board and the
// top leaf of a full pile. Over a whole open-and-close, forward and back,
// no frame with two leaves inside each other, on the sheet or in the fold.

// From one leaf to the next, out from the board. A leaf is PAGE_DEPTH
// (2.4 mm) thick, and the drawn sheet is straight between bones and turns
// a corner at each, so what is left between two leaves is less than the
// pitch minus the thickness. Settled, inside a pile: 2.6 mm -> -0.27,
// 2.9 -> 0.01, 3.2 -> 0.30. The 0.8 mm that shows between two leaves on
// the straight is what the corners take back.
export const OPEN_PITCH = 0.0032

// Room added between the two piles, on each side of the gutter. None: the
// two innermost leaves are bound a pitch apart like any two neighbours.
// It was 1.5 mm, and what it bought was a gap down the middle of the open
// book that read as a hole. Settled, the facing pair clears by 0.80 mm
// without it, and over a whole open-and-close they never touch. (Read with
// the bench's former blended samples and the old leaning roots, taking it
// away seemed to cost grazing in the fold whenever the book opened or
// closed; on the drawn surface, with the root straight, there is none.)
export const PILE_PARTING = 0

// Where the two boards are bound in the open book: either side of the
// centre line, the whole block between them.
const SPINE_HALF = ((PAGE_COUNT - 1) / 2) * OPEN_PITCH + PILE_PARTING

// The board's own curl, bone by bone: the tutorial's recipe at rest. Bones
// near the spine lean toward the side it lies on (inside curve), the rest
// resist that lean (outside curve). `target` is ±90°, which side.
//
// Except the first bone, which rises STRAIGHT out of the spine; its 4° go
// to the second, so the leaf ends up turned as far as before. Leaning from
// the root, every leaf left the binding on a slant, the pile's roots
// fanned out of the gutter in a V, and each root, offset along a leaning
// normal, sat higher than the one under it — 1.8 mm by the middle of the
// book, a step of empty leather. Straight, the roots lie level, side by
// side, and the two piles go up from the gutter together before they part.
export const restCurl = (target) => {
  const angles = []
  for (let i = 0; i <= PAGE_SEGMENTS; i++) {
    const inside = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0
    const outside = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0
    angles.push(INSIDE_CURVE_STRENGTH * inside * target - OUTSIDE_CURVE_STRENGTH * outside * target)
  }
  angles[1] += angles[0]
  angles[0] = 0
  return angles
}

// The leaf lying `offset` outside the board whose bone angles are `base`,
// built on its own bones `segmentWidth` apart. `side` is the sign of the
// pile's target. Returns the leaf's bone angles, and where its root sits
// from the board's as [up, lateral] in the book's tilted frame — where a
// bone at heading t points (cos t, -sin t), since rotation.y turns local x
// away from z.
//
// It runs on the smooth curve the board's bones stand for — each segment's
// heading at its middle, linear in between — and not on their polyline: a
// leaf laid off the polyline's corners cuts inside them, and that lost
// 0.69 mm of the clearance at 3.2 mm of pitch, against 0.48 this way (read
// with the bench's former blended samples).
export function parallelCurl(base, offset, segmentWidth, side) {
  const headings = []
  let heading = 0
  for (let j = 0; j < PAGE_SEGMENTS; j++) {
    heading += base[j]
    headings.push(heading)
  }
  const headingAt = (s) => {
    const x = s / SEGMENT_WIDTH - 0.5
    if (x <= 0) return headings[0]
    if (x >= PAGE_SEGMENTS - 1) return headings[PAGE_SEGMENTS - 1]
    const j = Math.floor(x)
    return headings[j] + (headings[j + 1] - headings[j]) * (x - j)
  }
  // A curve `offset` outside another turns through the same headings over
  // a longer arc, ds' = (1 + offset * curvature) ds — which is where the
  // short fore-edge comes from.
  const outerLength = (s) => s + offset * side * (headingAt(s) - headings[0])

  const angles = []
  let previous = 0
  for (let j = 0; j < PAGE_SEGMENTS; j++) {
    const want = (j + 0.5) * segmentWidth
    let lo = 0
    let hi = want
    for (let k = 0; k < 40; k++) {
      const mid = (lo + hi) / 2
      if (outerLength(mid) < want) lo = mid
      else hi = mid
    }
    const t = headingAt((lo + hi) / 2)
    angles.push(j === 0 ? t : t - previous)
    previous = t
  }
  // The last bone carries only the fore-edge's own cut, past the end of
  // the sheet; it keeps the board's.
  angles.push(base[PAGE_SEGMENTS])

  const t0 = headings[0]
  return { angles, root: [offset * side * Math.sin(t0), offset * side * Math.cos(t0)] }
}

// Everything a leaf takes from the reading state: its bone angles at rest,
// where it is bound on the open spine, and how high it sits in the closed
// block — the two ends of the spine's turn (see spineRoot). On a closed
// page the open root is the one it is about to open to, and on an open
// page the closed height is the one it would close to: the nearer cover.
export const leafPose = (number, page) => {
  const closedBook = page === 0 || page === PAGE_COUNT
  const openPage = Math.min(Math.max(page, 1), PAGE_COUNT - 1)
  const turned = openPage > number
  const side = turned ? -1 : 1
  const depth = turned ? number : PAGE_COUNT - 1 - number
  const board = number === 0 || number === PAGE_COUNT - 1
  const curl = parallelCurl(
    restCurl((side * Math.PI) / 2),
    depth * OPEN_PITCH,
    board ? SEGMENT_WIDTH : PAPER_SEGMENT_WIDTH,
    side
  )
  // Closed, the whole leaf lies flat on whichever side it is on.
  const flat = Array.from({ length: PAGE_SEGMENTS + 1 }, (_, i) =>
    i === 0 ? ((page > number ? -1 : 1) * Math.PI) / 2 : 0
  )
  const closedDepth = page <= PAGE_COUNT / 2 ? PAGE_COUNT - 1 - number : number
  return {
    angles: closedBook ? flat : curl.angles,
    openRoot: [curl.root[0], -side * SPINE_HALF + curl.root[1]],
    closedHeight: closedDepth * CLOSED_PITCH,
  }
}

// The spine turning over, between the closed block, where the roots stand
// in a column, and the open book, where they lie in a row. Each root runs
// a quarter ellipse between the two, rather than the diagonal that gliding
// its two coordinates apart would trace: on that diagonal neighbouring
// roots passed 2.1 mm apart, less than a leaf is thick, and the leaves
// crossed in the fold every time the book opened or closed (1.29 mm deep;
// measured with the old leaning roots and 1.5 mm of PILE_PARTING).
// `openness` runs from 0, closed, to 1, open.
export const spineRoot = (pose, openRoot, openness) => {
  const a = (openness * Math.PI) / 2
  return [pose.closedHeight * Math.cos(a) + openRoot[0] * Math.sin(a), openRoot[1] * Math.sin(a)]
}

// How long the spine takes to turn, opening and closing (smoothDamp's
// smooth time). Frames with two leaves touching over a whole open-and-close
// (2000), forward and back, and how deep the worst one goes:
//
//   0.30 / 0.30 -> 0    0.45 / 0.45 -> 0    0.80 / 0.40 -> 0
//   0.45 / 0.20 -> 64 (0.38 mm)             0.60 / 0.40 -> 0
//
// Only a close much faster than the open breaks it: the spine turns over
// before the board that closes it has swung clear. 0.6 / 0.4 sits in the
// middle of the clean ones.
export const SPINE_OPEN_TIME = 0.6
export const SPINE_CLOSE_TIME = 0.4

export const spineTurnTime = (page) => (page === 0 || page === PAGE_COUNT ? SPINE_CLOSE_TIME : SPINE_OPEN_TIME)

// How fast a leaf's root glides along the open spine. With the roots level
// and no PILE_PARTING, a leaf is bound at the same spot whichever pile it
// lies in, so today nothing glides; this only moves a root if the parting
// comes back, by twice the parting. The old stacking glide's 0.45.
export const ROOT_SMOOTH_TIME = 0.45
