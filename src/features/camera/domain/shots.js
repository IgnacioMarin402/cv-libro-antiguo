import * as THREE from 'three'
import { BOOK, topSurfaceY } from '@/features/book'

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
    target: new THREE.Vector3(0, topSurfaceY, -BOOK.coverH * 0.05),
  },
  // Open book: closer and more frontal, re-centered onto the left-hand
  // (read) side where the turned pages pile up.
  open: {
    position: new THREE.Vector3(0.05, 0.78, 1.05),
    target: new THREE.Vector3(-BOOK.coverW * 0.45, topSurfaceY + 0.05, 0.03),
  },
}

export const shotFor = (open) => (open ? SHOTS.open : SHOTS.rest)

export const INTRO_DURATION = 2000
export const OPEN_ZOOM_DURATION = 1700

// How far the visitor may roam once the camera hands control over: close
// enough to inspect the tooling, never far enough to leave the table or
// drop below its surface.
export const ORBIT_LIMITS = {
  dampingFactor: 0.08,
  minDistance: 0.35,
  maxDistance: 2.4,
  minPolarAngle: 0.25,
  maxPolarAngle: 1.45,
}
