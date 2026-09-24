import { createPortal } from '@react-three/fiber'
import { HALO_SIZE } from '../domain/gem'

// Never hit by a ray: the halo sits in front of the book while the staff is
// out, and a click through it must still reach the page.
const noRaycast = () => null

// The halo around the gem, mounted on the bone that carries it so it goes
// wherever the staff goes.
export default function GemHalo({ bone, center, material, haloRef }) {
  return createPortal(
    <sprite
      ref={haloRef}
      position={center}
      scale={[HALO_SIZE, HALO_SIZE, 1]}
      material={material}
      raycast={noRaycast}
      visible={false}
    />,
    bone,
  )
}
