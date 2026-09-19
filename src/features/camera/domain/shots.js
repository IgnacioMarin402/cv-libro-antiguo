import * as THREE from 'three'
import { topSurfaceY, PAGE_WIDTH, PAGE_HEIGHT } from '@/features/pageCurlBook'

// The camera's framings, as data: where it stands and what it looks at at
// each moment of the visit. Every target is derived from the book's own
// measurements rather than hand-tuned world coordinates, so re-proportioning
// the book re-aims the camera with it.

// The lens itself — the scene's only camera, configured where the canvas is
// created but owned by this feature.
export const CAMERA = { fov: 38, near: 0.05, far: 50 }

export const SHOTS = {
  // The wide establishing shot the visit opens on, looking down at the table.
  intro: {
    position: new THREE.Vector3(0.15, 1.9, 2.5),
    target: new THREE.Vector3(0, 0.3, 0),
  },
  // Closed book, seen from a comfortable reading distance and slightly off
  // to one side.
  rest: {
    position: new THREE.Vector3(0.35, 0.62, 0.95),
    target: new THREE.Vector3(0, topSurfaceY, -PAGE_HEIGHT * 0.05),
  },
  // Open book: closer and more frontal, re-centered onto the left-hand
  // (read) side where the turned pages pile up.
  open: {
    position: new THREE.Vector3(0.05, 0.78, 1.05),
    target: new THREE.Vector3(-PAGE_WIDTH * 0.45, topSurfaceY + 0.05, 0.03),
  },
}

export const shotFor = (open) => (open ? SHOTS.open : SHOTS.rest)

export const INTRO_DURATION = 2000
export const OPEN_ZOOM_DURATION = 1700

// How far the visitor may roam once the camera hands control over: close
// enough to inspect the tooling, never far enough to leave the table or
// drop below its surface.
//
// maxDistance is what lets the table's pedestal read. The camera always
// aims at the book and can't dip below the table's plane, so everything
// under the top projects into a thin wedge pinned against the bottom of
// the frame. At 2.4 that wedge was 6.5 deg of screen and the foot landed
// 0.76 deg above the frame's edge — about 9 px of dark wood on black, i.e.
// invisible. Backing off to 3.6 opens the wedge to ~12 deg and the column
// reads whole. Measured, not guessed; re-measure if the fov, the table
// radius or the pedestal's height change.
export const ORBIT_LIMITS = {
  dampingFactor: 0.08,
  minDistance: 0.35,
  maxDistance: 3.6,
  minPolarAngle: 0.25,
  maxPolarAngle: 1.45,
}
