import { useMemo } from 'react'
import { latheFromProfile } from '@/shared/three/latheProfile'
import { createWoodTexture } from './textures/woodTexture'
import { TABLE, TABLE_SURFACE_Y } from './domain/tableTop'
import { PEDESTAL_PROFILE, PEDESTAL_BASE_Y } from './domain/tablePedestal'

export default function Table() {
  const woodTex = useMemo(() => createWoodTexture(), [])
  // The top is a cylinder and needs no building; the pedestal is a turned
  // silhouette, so it comes off the same lathe as the candlestick.
  const pedestal = useMemo(() => latheFromProfile(PEDESTAL_PROFILE, TABLE.segments), [])

  return (
    <group>
      <mesh position-y={TABLE_SURFACE_Y - TABLE.thickness / 2} receiveShadow>
        <cylinderGeometry args={[TABLE.topRadius, TABLE.bottomRadius, TABLE.thickness, TABLE.segments]} />
        <meshStandardMaterial map={woodTex} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Only the lower, wider stretch of this is ever on screen: the top
          itself hides the shaft from every angle the orbit allows, and what
          shows below the rim is the foot. It's built whole anyway — the
          part that reads has to be the end of something. */}
      <mesh geometry={pedestal} position-y={PEDESTAL_BASE_Y} receiveShadow>
        <meshStandardMaterial map={woodTex} roughness={0.85} metalness={0.05} />
      </mesh>
    </group>
  )
}
