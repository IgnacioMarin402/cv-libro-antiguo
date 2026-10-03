import { use, useRef } from 'react'
import { loadNameFont } from '../textures/nameFont'
import { useNameLettering } from '../hooks/useNameLettering'
import { useSparks } from '../hooks/useSparks'
import { useNameReveal } from '../hooks/useNameReveal'

// The dogs' names over the painting, in the frame's own space (see
// domain/names). Lettered only once their font is in, so they wait for it;
// hidden until the visitor has come to look (`focused`) and the lens
// stands square (`squareSince`, see hooks/useLensSquare). The sparks are
// one draw call, never culled: they move every frame, and the bounds three
// would cull them by are the first's.
export default function DogNames({ focused, squareSince }) {
  use(loadNameFont())
  const group = useRef()
  const names = useNameLettering()
  const sparks = useSparks()
  useNameReveal({ focused, squareSince, group, names, sparks })

  return (
    <group ref={group} visible={false}>
      {names.map((name) => (
        <mesh key={name.text} geometry={name.geometry} material={name.material} position={name.position} />
      ))}
      <points geometry={sparks.geometry} material={sparks.material} frustumCulled={false} />
    </group>
  )
}
