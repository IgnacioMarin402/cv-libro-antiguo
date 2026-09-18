import { useMemo } from 'react'
import * as THREE from 'three'
import { latheFromProfile } from '@/shared/three/latheProfile'
import { DOME_PROFILE, RIM_RADIUS, NASAL } from './domain/helmetShell'

// Still a blockout: wireframe, so it reads as work-in-progress next to the
// finished props rather than as a solid object that missed its material.
export default function Helmet({ position = [0, 0, 0] }) {
  const domeGeo = useMemo(() => latheFromProfile(DOME_PROFILE, 32), [])
  const nasalGeo = useMemo(() => new THREE.BoxGeometry(NASAL.width, NASAL.height, NASAL.depth), [])
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x44ccff, wireframe: true }), [])

  return (
    <group position={position}>
      <mesh geometry={domeGeo} material={wireMat} castShadow receiveShadow />
      <mesh geometry={nasalGeo} material={wireMat} position={[0, -0.025, RIM_RADIUS * 0.98]} castShadow />
    </group>
  )
}
