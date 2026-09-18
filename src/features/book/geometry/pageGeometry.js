import { buildPageGrid, pageSpineBend, pageGridGeometry } from './pageSheet'
import { PAGE_WIDTH, PAGE_HEIGHT, PAGE_THICKNESS, SPINE_HALF_HEIGHT } from '../domain/binding'

// This book's leaf, built out of the generic bendable-sheet math in
// pageSheet.js with the binding's own measurements.

// Grid topology (+ jittered rest coordinates) for a leaf, built once and
// shared by every page's geometry — bending only ever moves these same
// vertices, never reshapes the mesh itself. segsX subdivides the bend axis
// (spine -> fore-edge) finely enough to curve smoothly; segsZ just needs
// enough rows for a believably uneven fore-edge.
export function createPageGrid() {
  return buildPageGrid(PAGE_WIDTH, PAGE_HEIGHT, { segsX: 18, segsZ: 6, edgeJitter: 0.004, spineJitter: 0.0003 })
}

// Permanent curve every leaf keeps near its hinge — a graceful sweep
// spanning a good third of the leaf's own length, not a tight bump confined
// to the first few millimeters, so it reads the way a real page's own give
// does (a long, soft droop) rather than as a hard crease stamped right at
// the edge. The peak height is still capped well under a cover's thickness
// (closed pages sit flush under one — see pageSpineBend), so stretching the
// run out doesn't risk poking through it; it only makes the curve gentler
// per unit length.
export function createPageRestBend() {
  return pageSpineBend(SPINE_HALF_HEIGHT * 0.15, SPINE_HALF_HEIGHT * 0.18, PAGE_WIDTH * 0.3)
}

// The shared, static geometry every leaf renders with at rest. Leaves only
// ever swap onto a private clone of this while actively flipping (see
// usePageFlip) — idle pages stay a single cheap instance.
export function createPageGeometry(grid, restBend) {
  return pageGridGeometry(grid, PAGE_THICKNESS, restBend)
}
