import { useMemo } from 'react'
import * as THREE from 'three'
import { latheFromProfile } from '@/shared/three/latheProfile'
import { HOLDER_PROFILE } from './domain/candleHolder'
import { CANDLE_SCALE } from './domain/candle'

// A turned pewter candlestick: nothing but its profile, revolved.
export default function CandleHolder({ position = [0, 0, 0] }) {
  const geometry = useMemo(() => latheFromProfile(HOLDER_PROFILE, 48), [])

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0xf3efe4, metalness: 1, roughness: 0.22 }),
    []
  )

  return (
    <mesh geometry={geometry} material={material} position={position} scale={CANDLE_SCALE} castShadow receiveShadow />
  )
}
