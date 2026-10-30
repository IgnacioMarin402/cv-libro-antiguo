import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import HitBox from './components/HitBox'
import { BUST_SCALE } from './domain/bust'
import { HEART_SCALE, HEARTS } from './domain/treat'
import { useBustMotion } from './hooks/useBustMotion'
import { useTreatThrow } from './hooks/useTreatThrow'
import { useLensArrived } from './hooks/useLensArrived'
import { useBustOverlay } from './hooks/useBustOverlay'
import { animateBust } from './shaders/bustMotion'

// Loaded from a file, like the shield.
const MODEL_URL = '/models/shourdo-bust.glb'

// Casts the candle's shadows and receives them, like the shield: its mesh
// is single-sided too. His head moves a little, he blinks and he snaps his
// jaw, in the mesh's own shaders (see domain/head, domain/eyes and
// domain/jaw).
function BustModel({ uniforms }) {
  const { scene } = useGLTF(MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
      animateBust(object, uniforms)
    })
  }, [scene, uniforms])

  return <primitive object={scene} />
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
//
// A click on him calls onFocus: the visitor wants to look at him up close
// (none while they're looking at something else). While they do
// (`focused`), once the camera has come, the way back (`backRef`, see
// shared/ui/BackButton) and the treat (`treatRef`, see TreatButton) show
// beside him, over the canvas — and `throwRef` is how the treat, out
// there, throws one in here: it holds a function that does, and says false
// while one is still in the air.
export default function Bust({ focused = false, onFocus, backRef, treatRef, throwRef, ...props }) {
  const root = useRef()
  const motion = useBustMotion()
  const treat = useTreatThrow({ root, snap: motion.snap })
  const arrivedSince = useLensArrived(focused, root)
  useBustOverlay({ focused, root, arrivedSince, back: backRef, treat: treatRef })

  useEffect(() => {
    if (!throwRef) return
    throwRef.current = treat.throwTreat
    return () => {
      throwRef.current = null
    }
  })

  // The treat and the hearts fly in the room, outside his group: it's in
  // the model's units.
  return (
    <>
      <group ref={root} {...props} scale={BUST_SCALE}>
        <Suspense fallback={null}>
          <BustModel uniforms={motion.uniforms} />
        </Suspense>
        <HitBox focused={focused} onFocus={onFocus} />
      </group>
      <mesh
        ref={treat.treat}
        geometry={treat.treatGeometry}
        material={treat.treatMaterial}
        visible={false}
        castShadow
      />
      {HEARTS.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (treat.hearts.current[i] = el)}
          geometry={treat.heartGeometry}
          material={treat.heartMaterials[i]}
          scale={HEART_SCALE}
          visible={false}
        />
      ))}
    </>
  )
}
