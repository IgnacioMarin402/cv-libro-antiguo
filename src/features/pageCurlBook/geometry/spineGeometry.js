import * as THREE from 'three'
import { PAGE_HEIGHT, PAGE_DEPTH } from '../domain/pageCurl'
import { SPINE_ROWS, SPINE_SKIN, spineSample } from '../domain/spine'
import { skinnedPoint, boneAt, BOARD_CUT } from './pageGeometry'

// The spine's leather as a quad strip: SPINE_ROWS rows across the fold by
// two columns, one at each end of the book's height. It has no thickness of
// its own (rendered DoubleSide), because it is a skin lying on the boards
// rather than a board itself.
//
// The row positions are rebuilt every frame from the two boards' own posed
// bones (see updateSpineSkin) — the boards curl as they turn, so anything
// glued to them has to curl with them. Only the positions change; the index
// buffer never does.
export function createSpineGeometry() {
  const positions = new Float32Array(SPINE_ROWS * 2 * 3)
  const indices = []
  for (let j = 0; j < SPINE_ROWS - 1; j++) {
    const a = j * 2
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.setDrawRange(0, 0)
  return geo
}

const _p = new THREE.Vector3()
const _out = new THREE.Vector3()
const _downFront = new THREE.Vector3()
const _downBack = new THREE.Vector3()
const _down = new THREE.Vector3()

// Re-lays the strip over whatever the two boards are doing right now.
//
// Each row is a point on the outer face of one board — the tooled side, so
// the leather is on the outside of the book and not inside the gutter —
// pushed a hair clear of it, plus the bulge that rounds the fold. The
// bulge goes AGAINST the direction the sheets leave the hinge, which is the
// one direction both boards agree on however far their angles have drifted
// (measured: 0.998, ∓0.07 in the book's own frame, open at any page). That
// is what keeps the two halves of the strip meeting in a curve at the fold
// instead of in the crease they used to make.
//
// `front` and `back` are the two boards' hinge groups; the skinned mesh is
// found under each, so the strip reads the same bones the sheet is drawn
// from. Returns false and leaves the geometry hidden if either is not
// mounted yet.
export function updateSpineSkin(geo, front, back, spineGroup) {
  if (!front || !back || !spineGroup) return false
  const frontMesh = front.getObjectByProperty('isSkinnedMesh', true)
  const backMesh = back.getObjectByProperty('isSkinnedMesh', true)
  if (!frontMesh || !backMesh) return false

  const frontBones = frontMesh.skeleton.bones
  const backBones = backMesh.skeleton.bones
  const sw = BOARD_CUT.segmentWidth

  // The fold's own "down": opposite the way the sheets rise out of the
  // hinge, averaged over the two boards so the strip does not lean toward
  // whichever one has swung further.
  _downFront.setFromMatrixColumn(frontBones[0].matrixWorld, 0)
  _downBack.setFromMatrixColumn(backBones[0].matrixWorld, 0)
  _down.addVectors(_downFront, _downBack).normalize().negate()

  const half = PAGE_HEIGHT / 2
  const skin = PAGE_DEPTH / 2 + SPINE_SKIN
  const pos = geo.attributes.position.array

  for (let i = 0; i < SPINE_ROWS; i++) {
    const { front: onFront, along, bulge } = spineSample(i)
    const bones = onFront ? frontBones : backBones
    const bone = boneAt(bones, sw, along)
    // The tooled face looks out of the closed book on the front board and
    // into the table on the back one, so "outward" is opposite on each.
    _out.setFromMatrixColumn(bone.matrixWorld, 2).normalize().multiplyScalar(onFront ? skin : -skin)

    for (let c = 0; c < 2; c++) {
      const y = c === 0 ? -half : half
      skinnedPoint(bones, sw, along, y, 0, _p)
      _p.add(_out).addScaledVector(_down, bulge)
      // The strip hangs under the tilt group, which already carries the
      // book's own rotation, so the world point has to come back into it.
      spineGroup.worldToLocal(_p)
      const base = (i * 2 + c) * 3
      pos[base] = _p.x
      pos[base + 1] = _p.y
      pos[base + 2] = _p.z
    }
  }

  geo.attributes.position.needsUpdate = true
  geo.computeVertexNormals()
  geo.setDrawRange(0, (SPINE_ROWS - 1) * 6)
  return true
}
