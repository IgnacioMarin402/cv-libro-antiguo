import { AMBIENT, COLD_FILL, KEY } from './domain/lightingRig'

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
      <directionalLight color={KEY.color} intensity={KEY.intensity} position={KEY.position} />
    </>
  )
}
