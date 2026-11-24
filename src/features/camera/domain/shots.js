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
}

// Open book: the lens goes straight to where the spread is read, not to a
// nearer look at the table — clicking the book is asking to read it. It
// looks down on the book almost square, READING_TILT off the vertical
// towards the reader, so the page's head is up and the lines run level
// across the screen: at 20 deg the perspective and the leaves' rise towards
// the spine sloped them visibly. Not 0: straight down, lookAt has no way to
// tell which way is up. And it
// stands as close as lets the whole spread fit READING_FILL of the screen in
// whichever dimension is tighter, so a phone held upright backs off rather
// than cropping a page.
//
// The spread, centred on the spine — which IS its middle: the two boards
// are bound either side of it and every other leaf reaches less far than
// the board under it (see pageCurlBook/domain/pile). Measured on the
// settled pose, it spans x [-0.349, +0.349] at every page; z is the board's
// height; and y leaves room for the leaves' rise towards the spine.
export const READING_TILT = 0.06
export const READING_FILL = 0.9
const SPREAD = new THREE.Box3(
  new THREE.Vector3(-0.35, 0, -PAGE_HEIGHT / 2),
  new THREE.Vector3(0.35, topSurfaceY + 0.05, PAGE_HEIGHT / 2),
)

export function readingShot(aspect, fovDegrees) {
  const target = new THREE.Vector3(0, topSurfaceY, 0)
  const toward = new THREE.Vector3(0, Math.cos(READING_TILT), Math.sin(READING_TILT))
  const lens = new THREE.PerspectiveCamera(fovDegrees, aspect, 0.01, 50)
  const corner = new THREE.Vector3()
  const fits = (distance) => {
    lens.position.copy(target).addScaledVector(toward, distance)
    lens.lookAt(target)
    lens.updateMatrixWorld()
    for (let i = 0; i < 8; i++) {
      corner.set(i & 1 ? SPREAD.max.x : SPREAD.min.x, i & 2 ? SPREAD.max.y : SPREAD.min.y, i & 4 ? SPREAD.max.z : SPREAD.min.z)
      corner.project(lens)
      if (Math.abs(corner.x) > READING_FILL || Math.abs(corner.y) > READING_FILL) return false
    }
    return true
  }
  // Fitting only gets easier backing off, so halve the gap to the nearest
  // distance that fits.
  let near = 0.2
  let far = 6
  for (let i = 0; i < 30; i++) {
    const mid = (near + far) / 2
    if (fits(mid)) far = mid
    else near = mid
  }
  return { position: target.clone().addScaledVector(toward, far), target }
}

// Closing the book backs off further than the rest shot the visit settles
// on: the reader is done with it and wants the room back. Same line of
// sight, CLOSE_BACKOFF times as far from the book: 1.50 m against 1.15.
// Measured live, the nearest thing to the lens there (a throne's bounding
// box) is 34.6 cm away.
export const CLOSE_BACKOFF = 1.3
const CLOSED = {
  position: SHOTS.rest.target.clone().lerp(SHOTS.rest.position, CLOSE_BACKOFF),
  target: SHOTS.rest.target,
}

export const shotFor = (open, aspect, fovDegrees) => (open ? readingShot(aspect, fovDegrees) : CLOSED)

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
// (That was measured on the scene's first table, a pedestal, and not again
// since.) It was later let out to 3.87, as far as the walls allow, and the
// lens was caught inside the fireplace — which it could already reach at
// 3.6, low and backed all the way out toward it. 3.3 is the farthest that
// keeps it out of everything in the room: over every orbit and aim, with
// the polar limit, it keeps 6.2 cm from the fireplace's mantel, outside the
// near plane's 2, and more than 20 cm from anything else. At 3.35 the
// mantel came within 1.2 cm; at 3.4 the lens went into it.
//
// minPolarAngle is 0 so the visitor can come all the way overhead and read
// the open spread flat, straight down. OrbitControls clamps the pole to
// its own epsilon, so 0 is the vertical without the gimbal flip. From up
// there the whole open book (0.698 x 0.527 m, measured) needs about 1 m of
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
  maxDistance: 3.3,
  minPolarAngle: 0,
  maxPolarAngle: 1.45,
}
