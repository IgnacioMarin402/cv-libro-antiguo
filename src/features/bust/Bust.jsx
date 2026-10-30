import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import HitBox from './components/HitBox'
import { BUST_SCALE } from './domain/bust'
import { HEART_SCALE, HEARTS } from './domain/cookie'
import { useBustMotion } from './hooks/useBustMotion'
import { useCookieThrow } from './hooks/useCookieThrow'
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
// shared/ui/BackButton) and the cookie (`cookieRef`, see CookieButton) show
// beside him, over the canvas — and `throwRef` is how the cookie, out
// there, throws one in here: it holds a function that does, and says false
// while one is still in the air.
export default function Bust({ focused = false, onFocus, backRef, cookieRef, throwRef, ...props }) {
  const root = useRef()
  const motion = useBustMotion()
  const cookie = useCookieThrow({ root, snap: motion.snap })
  const arrivedSince = useLensArrived(focused, root)
  useBustOverlay({ focused, root, arrivedSince, back: backRef, cookie: cookieRef })

  useEffect(() => {
    if (!throwRef) return
    throwRef.current = cookie.throwCookie
    return () => {
      throwRef.current = null
    }
  })

  // The cookie and the hearts fly in the room, outside his group: it's in
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
        ref={cookie.cookie}
        geometry={cookie.cookieGeometry}
        material={cookie.cookieMaterial}
        visible={false}
        castShadow
      />
      {HEARTS.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (cookie.hearts.current[i] = el)}
          geometry={cookie.heartGeometry}
          material={cookie.heartMaterials[i]}
          scale={HEART_SCALE}
          visible={false}
        />
      ))}
    </>
  )
}
