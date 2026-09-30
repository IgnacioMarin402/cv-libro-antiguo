import { BURST_COUNT } from '../domain/heart'

// Not culled: its bounding sphere would be taken once, round the sparks at
// rest in a heap, and never follow them out. Never hit by a ray either, so
// a click through a spark still reaches whatever is behind it.
const noRaycast = () => null

export default function HeartBurst({ points, burst, material }) {
  return (
    <points ref={points} material={material} visible={false} frustumCulled={false} raycast={noRaycast}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={BURST_COUNT} array={burst.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={BURST_COUNT} array={burst.colors} itemSize={3} />
      </bufferGeometry>
    </points>
  )
}
