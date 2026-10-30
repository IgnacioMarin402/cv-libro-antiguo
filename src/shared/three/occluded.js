import * as THREE from 'three'

// Whether anything drawn lies along `ray` nearer than `distance` — for a
// click on a stand-in that R3F hit through things it never tests: it only
// raycasts what answers the pointer, so a table between the lens and a
// clickable box doesn't stop the click reaching the box. Meshes under
// `ignore` (the stand-in's own object) don't count, nor do glows and
// flames (transparent, not writing depth), which a click goes through.
//
// Exact on each mesh whose box the ray crosses in time, except past
// MAX_EXACT triangles, where its box alone says so: the tankard and the
// quill have two million each, and testing them took a click to 248 ms.
// With it, from 288 places round the table, a click took 4 ms on average
// and 36 at most. Meant for a click, not a hover, which runs on every move.
const MAX_EXACT = 500_000

const caster = new THREE.Raycaster()
const box = new THREE.Box3()
const point = new THREE.Vector3()

const triangles = ({ index, attributes }) => (index ? index.count : attributes.position.count) / 3

function drawn(mesh, ignore) {
  for (let o = mesh; o; o = o.parent) {
    if (!o.visible || o === ignore) return false
  }
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  return materials.some((m) => m.visible && !(m.transparent && !m.depthWrite))
}

export function occluded(scene, ray, distance, ignore) {
  caster.ray.copy(ray)
  caster.far = distance
  let hit = false
  scene.traverse((object) => {
    if (hit || !object.isMesh || !drawn(object, ignore)) return
    const { geometry } = object
    if (!geometry.boundingBox) geometry.computeBoundingBox()
    box.copy(geometry.boundingBox).applyMatrix4(object.matrixWorld)
    if (!ray.intersectBox(box, point) || point.distanceTo(ray.origin) > distance) return
    if (triangles(geometry) > MAX_EXACT) {
      hit = true
      return
    }
    const hits = []
    object.raycast(caster, hits)
    hit = hits.length > 0
  })
  return hit
}
