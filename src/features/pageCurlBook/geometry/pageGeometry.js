import * as THREE from 'three'
import { PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS, SEGMENT_WIDTH } from '../domain/pageCurl'

// A page sheet as a skinned box: a BoxGeometry subdivided once per bone
// along its width, each vertex weighted between the two bones straddling
// its x position. Translated so x=0 sits at the spine (hinge) and
// x=PAGE_WIDTH at the fore-edge, matching createPageSkeleton's chain.
export function createPageGeometry() {
  const geo = new THREE.BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS, 2)
  geo.translate(PAGE_WIDTH / 2, 0, 0)

  const position = geo.attributes.position
  const vertex = new THREE.Vector3()
  const skinIndexes = []
  const skinWeights = []
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)
    const skinIndex = Math.max(0, Math.floor(vertex.x / SEGMENT_WIDTH))
    const skinWeight = (vertex.x % SEGMENT_WIDTH) / SEGMENT_WIDTH
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0)
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0)
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndexes, 4))
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4))
  return geo
}

// A bone per segment boundary, chained parent-to-child along the sheet's
// width — the rig shape createPageGeometry's skin indices expect.
export function createPageSkeleton() {
  const bones = []
  for (let i = 0; i <= PAGE_SEGMENTS; i++) {
    const bone = new THREE.Bone()
    bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH
    if (i > 0) bones[i - 1].add(bone)
    bones.push(bone)
  }
  return new THREE.Skeleton(bones)
}
