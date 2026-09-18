import { useMemo } from 'react'
import { createWoodTexture } from './textures/woodTexture'
import { TABLE, TABLE_SURFACE_Y } from './domain/tableTop'

export default function Table() {
  const woodTex = useMemo(() => createWoodTexture(), [])

  return (
    <mesh position-y={TABLE_SURFACE_Y - TABLE.thickness / 2} receiveShadow>
      <cylinderGeometry args={[TABLE.topRadius, TABLE.bottomRadius, TABLE.thickness, TABLE.segments]} />
      <meshStandardMaterial map={woodTex} roughness={0.85} metalness={0.05} />
    </mesh>
  )
}
