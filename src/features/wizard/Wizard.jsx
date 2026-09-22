import { Suspense, useLayoutEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useWizardClips } from './hooks/useWizardClips'
import { WIZARD_SCALE } from './domain/wizard'

// The one prop that comes from a file rather than from code. It faces +z as
// exported; the layout turns it toward the book.
const MODEL_URL = '/models/wizard-cat.glb'

function WizardModel({ open, ...props }) {
  const { scene, animations } = useLoader(GLTFLoader, MODEL_URL)
  const wave = useWizardClips(scene, animations, open)

  // Casts its shadow on the table but doesn't receive any. The candle's
  // shadow has no bias, and this double-sided mesh shadowed itself in fine
  // stripes all over (shadow acne): on a close-up, 3.4 times the fine detail
  // of the same shot without it — and the normal map had nothing to do with it.
  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) object.castShadow = true
    })
  }, [scene])

  return (
    <group {...props} scale={WIZARD_SCALE} onClick={wave}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the
// scene: without one, R3F's Canvas suspends whole and the table, the book
// and the candle all wait for the wizard.
export default function Wizard(props) {
  return (
    <Suspense fallback={null}>
      <WizardModel {...props} />
    </Suspense>
  )
}
