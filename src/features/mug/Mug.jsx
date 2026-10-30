import { Suspense, useLayoutEffect, useRef } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import ClickBox from '@/shared/three/ClickBox'
import { MUG_SCALE, HIT_BOX } from './domain/mug'
import { usePour } from './hooks/usePour'
import { useLensArrived } from './hooks/useLensArrived'
import { useWayBack } from './hooks/useWayBack'

// Loaded from a file, like the helmet. Its relief looks down +z as
// exported; the layout turns it.
const MODEL_URL = '/models/dragon-mug.glb'

// Casts the candle's shadows and receives them: single-sided, like the
// shield, so the candle's shadow doesn't stripe it the way it did the
// double-sided wizard and helmet.
function MugModel() {
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

// Its own Suspense, so the file loads without holding up the rest of the
// scene.
//
// A click on it calls onFocus: the visitor wants to look at it up close
// (none while they're looking at something else). While they do
// (`focused`), once the camera has come, the way back (`backRef`, see
// shared/ui/BackButton) shows beside it — and the first time in a visit,
// it fills with beer (see domain/beer). The beer and its head don't cast
// the candle's shadow: the tankard's own does, round them.
export default function Mug({ focused = false, onFocus, backRef, ...props }) {
  const root = useRef()
  const arrivedSince = useLensArrived(focused, root, MUG_SCALE)
  const beer = usePour(arrivedSince)
  useWayBack({ focused, root, arrivedSince, button: backRef })

  return (
    <group ref={root} {...props} scale={MUG_SCALE}>
      <group ref={beer.shaker}>
        <Suspense fallback={null}>
          <MugModel />
        </Suspense>
        <mesh ref={beer.beer} geometry={beer.beerGeometry} material={beer.beerMaterial} visible={false} receiveShadow />
        <mesh ref={beer.foam} geometry={beer.foamGeometry} material={beer.foamMaterial} visible={false} receiveShadow />
      </group>
      <ClickBox center={HIT_BOX.center} size={HIT_BOX.size} live={!focused && !!onFocus} onClick={() => onFocus()} />
    </group>
  )
}
