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
  // to one side. Aimed at the middle of the board, not at the spine: this
  // binding hinges AT the book's origin and its leaves run out to +x, so a
  // closed book occupies x [0, PAGE_WIDTH] — measured — and half its width
  // is the centre. (The scene's first book, features/book, straddled the
  // origin instead; targeting x=0 was that book's centre, and pointed at
  // this one's edge, throwing it 8% of a half-width right of frame.)
  rest: {
    position: new THREE.Vector3(0.35, 0.62, 0.95),
    target: new THREE.Vector3(PAGE_WIDTH / 2, topSurfaceY, -PAGE_HEIGHT * 0.05),
  },
  // Open book: closer and more frontal, centred on the spine — which IS
  // the open spread's middle, since the two piles are symmetric across it
  // by construction (see stackOffset). Measured on the settled pose, the
  // spread spans x [-0.333, +0.321]: 6mm off centre, i.e. centred.
  open: {
    position: new THREE.Vector3(0.05, 0.78, 1.05),
    target: new THREE.Vector3(0, topSurfaceY + 0.05, 0.03),
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
//
// minPolarAngle is 0 so the visitor can come all the way overhead and read
// the open spread flat, straight down. OrbitControls clamps the pole to
// its own epsilon, so 0 is the vertical without the gimbal flip. From up
// there the whole open book (0.654 x 0.527 m, measured) needs about 1 m of
// distance to fit the 38 deg lens — well inside the roaming range.
export const ORBIT_LIMITS = {
  dampingFactor: 0.08,
  minDistance: 0.35,
  maxDistance: 3.6,
  minPolarAngle: 0,
  maxPolarAngle: 1.45,
}
