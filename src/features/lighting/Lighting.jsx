import { AMBIENT, COLD_FILL, TABLE_GLOW } from './domain/lightingRig'

export default function Lighting() {
  return (
    <>
      <ambientLight color={AMBIENT.color} intensity={AMBIENT.intensity} />
      <pointLight
        color={COLD_FILL.color}
        intensity={COLD_FILL.intensity}
        distance={COLD_FILL.distance}
        position={COLD_FILL.position}
      />
      <pointLight
        color={TABLE_GLOW.color}
        intensity={TABLE_GLOW.intensity}
        distance={TABLE_GLOW.distance}
        decay={TABLE_GLOW.decay}
        position={TABLE_GLOW.position}
      />
    </>
  )
}
