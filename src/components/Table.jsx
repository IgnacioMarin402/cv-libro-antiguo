import { useMemo } from 'react'
import { createWoodTexture } from '../utils/textures'

export default function Table() {
  const woodTex = useMemo(() => createWoodTexture(), [])

  return (
    <mesh position-y={-0.06} receiveShadow>
      <cylinderGeometry args={[2.6, 2.9, 0.12, 48]} />
      <meshStandardMaterial map={woodTex} roughness={0.85} metalness={0.05} />
    </mesh>
  )
}
