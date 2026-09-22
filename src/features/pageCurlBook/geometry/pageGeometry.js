import * as THREE from 'three'
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  SEGMENT_WIDTH,
  PAPER_WIDTH,
  PAPER_HEIGHT,
  PAPER_SEGMENT_WIDTH,
} from '../domain/pageCurl'

// A page sheet as a skinned box: a BoxGeometry subdivided once per bone
// along its width, each vertex weighted between the two bones straddling
// its x position. Translated so x=0 sits at the spine (hinge) and
// x=width at the fore-edge, matching createPageSkeleton's chain.
//
// Two cuts, because the boards overhang the text block (see SQUARE): the
// boards keep the book's full footprint and the paper is trimmed. Both run
// on the same 30 bones, so the same curl drives either — a shorter leaf
// just curls over a shorter arc, which is what a smaller sheet does.
export function createPageGeometry(width = PAGE_WIDTH, height = PAGE_HEIGHT) {
  const segmentWidth = width / PAGE_SEGMENTS
  const geo = new THREE.BoxGeometry(width, height, PAGE_DEPTH, PAGE_SEGMENTS, 2)
  geo.translate(width / 2, 0, 0)

  const position = geo.attributes.position
  const vertex = new THREE.Vector3()
  const skinIndexes = []
  const skinWeights = []
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)
    // Clamped to the last SEGMENT, not the last bone, so skinIndex + 1 is
    // always a bone that exists. The tutorial's `floor(x / w)` hands the
    // fore-edge column index 30, and its partner 31, which is one past the
    // end of a 31-bone chain; there the weight is meant to be 0, but
    // whether it lands on exactly 0 is a matter of how the width divides in
    // floating point. It did with 0.39/30 and it does not with the trimmed
    // paper, and a non-zero weight on bone 31 throws on every raycast
    // ("Cannot read properties of undefined (reading 'matrixWorld')") while
    // the picture still renders — so the build stays green and the scene
    // looks fine (see Verificación in CLAUDE.md).
    const skinIndex = Math.min(Math.max(0, Math.floor(vertex.x / segmentWidth)), PAGE_SEGMENTS - 1)
    const skinWeight = THREE.MathUtils.clamp((vertex.x - skinIndex * segmentWidth) / segmentWidth, 0, 1)
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0)
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0)
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndexes, 4))
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4))
  return geo
}

// A bone per segment boundary, chained parent-to-child along the sheet's
// width — the rig shape createPageGeometry's skin indices expect. The
// spacing is the sheet's own, so a trimmed leaf gets a shorter chain rather
// than a chain that overshoots its paper.
export function createPageSkeleton(segmentWidth = SEGMENT_WIDTH) {
  const bones = []
  for (let i = 0; i <= PAGE_SEGMENTS; i++) {
    const bone = new THREE.Bone()
    bone.position.x = i === 0 ? 0 : segmentWidth
    if (i > 0) bones[i - 1].add(bone)
    bones.push(bone)
  }
  return new THREE.Skeleton(bones)
}

// The two cuts the book is made of, as the pair every leaf needs.
export const BOARD_CUT = { width: PAGE_WIDTH, height: PAGE_HEIGHT, segmentWidth: SEGMENT_WIDTH }
export const PAPER_CUT = { width: PAPER_WIDTH, height: PAPER_HEIGHT, segmentWidth: PAPER_SEGMENT_WIDTH }

// Where a point of a posed sheet ends up in the world, the same two-bone
// blend the GPU runs: mesh.bind() re-runs calculateInverses with the chain
// already built, so bone i's inverse only undoes its rest offset, and the
// attached bindMatrixInverse cancels the mesh's own matrix. Anything that
// has to sit ON a leaf rather than be one — the spine's leather — needs
// this to find it (see geometry/spineGeometry).
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
export function skinnedPoint(bones, segmentWidth, x, y, z, target) {
  const i0 = Math.min(Math.max(0, Math.floor(x / segmentWidth)), PAGE_SEGMENTS - 1)
  const i1 = i0 + 1
  const w = THREE.MathUtils.clamp((x - i0 * segmentWidth) / segmentWidth, 0, 1)
  _a.set(x - i0 * segmentWidth, y, z).applyMatrix4(bones[i0].matrixWorld)
  _b.set(x - i1 * segmentWidth, y, z).applyMatrix4(bones[i1].matrixWorld)
  return target.copy(_a).multiplyScalar(1 - w).addScaledVector(_b, w)
}

// The bone that carries the sheet at distance x from the hinge, for when
// what is needed is its FRAME (which way the sheet faces there) rather
// than a point on it.
export function boneAt(bones, segmentWidth, x) {
  return bones[Math.min(Math.max(0, Math.round(x / segmentWidth)), PAGE_SEGMENTS)]
}
