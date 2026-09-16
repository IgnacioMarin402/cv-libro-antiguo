import { useMemo } from 'react'
import * as THREE from 'three'

// Radius/height pairs tracing the silhouette from the foot up the outside,
// over the rim, and back down the inside of the cup — the same profile a
// real candlestick gets on a lathe, just revolved digitally.
const PROFILE = [
  [0.1, 0.0],
  [0.1, 0.006],
  [0.075, 0.014],
  [0.045, 0.02],
  [0.03, 0.024],
  [0.042, 0.032],
  [0.028, 0.04],
  [0.05, 0.054],
  [0.026, 0.068],
  [0.032, 0.074],
  [0.024, 0.08],
  [0.07, 0.09],
  [0.073, 0.093],
  [0.045, 0.099],
  [0.047, 0.116],
  [0.052, 0.122],
  [0.043, 0.119],
  [0.013, 0.102],
  [0.0, 0.105],
]

export const HOLDER_CUP_Y = 0.105

export default function CandleHolder({ position = [0.34, 0, 0.42] }) {
  const geometry = useMemo(() => {
    const points = PROFILE.map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(points, 48)
  }, [])

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0xf3efe4, metalness: 1, roughness: 0.22 }),
    []
  )

  return <mesh geometry={geometry} material={material} position={position} castShadow receiveShadow />
}
