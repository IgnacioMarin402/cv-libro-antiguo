import * as THREE from 'three'

// Revolves a silhouette — [radius, height] pairs, read from the foot up —
// around the Y axis: the digital version of turning a piece on a lathe.
// Every lathed object in the scene (the candlestick, the helmet's bowl)
// keeps its profile as data in its own feature's domain and gets its mesh
// from here, so the two never re-implement the same revolution.
export function latheFromProfile(profile, segments = 48) {
  const points = profile.map(([radius, height]) => new THREE.Vector2(radius, height))
  return new THREE.LatheGeometry(points, segments)
}
