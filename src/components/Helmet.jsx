import { useMemo } from 'react'
import * as THREE from 'three'

// Spangenhelm-style bowl, lathed like the candle holder: a slight outward
// bulge near the base stands in for the brow band, then the shell tapers up
// to a rounded apex. Horns aren't in this pass — this is just a blockout to
// check proportions and placement before committing to the swept-horn geometry.
const DOME_PROFILE = [
  [0.1, 0.0],
  [0.102, 0.008],
  [0.098, 0.02],
  [0.101, 0.03],
  [0.094, 0.042],
  [0.078, 0.07],
  [0.055, 0.095],
  [0.03, 0.115],
  [0.01, 0.128],
  [0.0, 0.132],
]

const RIM_RADIUS = 0.1

export default function Helmet({ position = [0, 0, 0] }) {
  const domeGeo = useMemo(() => {
    const points = DOME_PROFILE.map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(points, 32)
  }, [])

  const nasalGeo = useMemo(() => new THREE.BoxGeometry(0.022, 0.05, 0.008), [])

  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x44ccff, wireframe: true }), [])

  return (
    <group position={position}>
      <mesh geometry={domeGeo} material={wireMat} castShadow receiveShadow />
      <mesh geometry={nasalGeo} material={wireMat} position={[0, -0.025, RIM_RADIUS * 0.98]} castShadow />
    </group>
  )
}
