import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@/shared/three/useGLTF'
import Painting from './components/Painting'
import DogNames from './components/DogNames'
import { useLensSquare } from './hooks/useLensSquare'
import { useWayBack } from './hooks/useWayBack'
import { FRAME, PORTRAIT_SCALE } from './domain/portrait'

// Loaded from a file, like the shield.
const MODEL_URL = '/models/portrait-frame.glb'

// Casts the candle's shadows and receives them, like the shield: its mesh
// is single-sided too.
function Frame() {
  const { scene } = useGLTF(MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return <primitive object={scene} />
}

// What a click on the portrait lands on: a flat face over the whole frame,
// never drawn. Not the frame itself: R3F raycasts what answers the pointer
// on every press and, for the hover, on every move, and a ray through the
// frame tests all its 525 thousand triangles — 158 ms, measured. This is
// two, like the heart's: 0.003 ms.
function FrameFace({ focused, onFocus }) {
  const material = useMemo(() => new THREE.MeshBasicMaterial({ visible: false }), [])

  // Once the visitor is looking at it, it's no longer something to click.
  const handleClick = (e) => {
    if (focused) return
    e.stopPropagation()
    document.body.style.cursor = 'auto'
    onFocus?.()
  }
  const handlePointerOver = (e) => {
    if (focused) return
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }
  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <mesh
      position={[0, (FRAME.bottom + FRAME.top) / 2, FRAME.front]}
      material={material}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <planeGeometry args={[FRAME.halfWidth * 2, FRAME.top - FRAME.bottom]} />
    </mesh>
  )
}

// Its own Suspense, so the files load without holding up the rest of the
// scene; the painting and its frame wait for each other, so neither hangs
// on the wall alone. The names wait on their font apart.
//
// A click on it calls onFocus: the visitor wants to look at it up close.
// While they do (`focused`), once the camera has come, the dogs' names show
// over the painting and `backRef` — the way back, a button over the canvas
// (see PortraitBack) — is shown and placed beside the frame.
export default function Portrait({ focused = false, onFocus, backRef, ...props }) {
  const root = useRef()
  const squareSince = useLensSquare(focused, root)
  useWayBack({ focused, root, squareSince, button: backRef })

  return (
    <group ref={root} {...props} scale={PORTRAIT_SCALE}>
      <Suspense fallback={null}>
        <Frame />
        <Painting />
        <FrameFace focused={focused} onFocus={onFocus} />
      </Suspense>
      <Suspense fallback={null}>
        <DogNames focused={focused} squareSince={squareSince} />
      </Suspense>
    </group>
  )
}
