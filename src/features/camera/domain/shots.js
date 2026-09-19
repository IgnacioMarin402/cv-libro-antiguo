import * as THREE from 'three'
import { topSurfaceY, PAGE_WIDTH, PAGE_HEIGHT } from '@/features/pageCurlBook'

// The camera's framings, as data: where it stands and what it looks at at
// each moment of the visit. Every target is derived from the book's own
// measurements rather than hand-tuned world coordinates, so re-proportioning
// the book re-aims the camera with it.

// The lens itself — the scene's only camera, configured where the canvas is
// created but owned by this feature.
//
// near is 2 cm rather than the usual 5 because an open book may be read
// from 18 cm away (see ORBIT_LIMITS): at that range a curled fore-edge can
// easily come within 5 cm of the lens and get sliced open. Swept over
// every orbit angle the visitor can reach, 5 cm clipped a leaf in 70% of
// them and 2 cm in 17%. The depth buffer pays about 4 microns of precision
// at reading distance for it, against leaves 3 mm apart — no contest.
export const CAMERA = { fov: 38, near: 0.02, far: 50 }

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
//
// How close in depends on what is being looked at, so there are two floors.
// A closed book is one object and is read whole: 35 cm frames it with room
// to spare. An open one is a PAGE, and the visitor picks which part of it
// with WASD (see domain/keyboardPan), so the lens is let down to 18 cm —
// 12.4 cm of table in frame, a quarter of the page's height. That is as
// close as it can go before the book starts slicing itself on the near
// plane: measured over every reachable angle and aim, a leaf comes inside
// the near plane in 8.8% of them at 18 cm, against 11.4% at today's 35 cm
// with the aim nailed to the centre. Closer than that and the number
// climbs fast (12.2% at 15 cm, 17.3% at 12 cm).
export const ORBIT_LIMITS = {
  dampingFactor: 0.08,
  minDistance: 0.35,
  openMinDistance: 0.18,
  maxDistance: 3.6,
  minPolarAngle: 0,
  maxPolarAngle: 1.45,
}
