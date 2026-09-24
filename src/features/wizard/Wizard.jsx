import { Suspense, useLayoutEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useWizardClips } from './hooks/useWizardClips'
import { useGemGlow } from './hooks/useGemGlow'
import { useBreathing } from './hooks/useBreathing'
import { useBlink } from './hooks/useBlink'
import GemHalo from './components/GemHalo'
import { WIZARD_SCALE } from './domain/wizard'

// The one prop that comes from a file rather than from code. It faces +z as
// exported; the layout turns it toward the book.
const MODEL_URL = '/models/wizard-cat.glb'

function WizardModel({ open, ...props }) {
  const { scene, animations } = useLoader(GLTFLoader, MODEL_URL)
  const { wave, staff, standing } = useWizardClips(scene, animations, open)
  // After the clips, which is the order their frames run in.
  useBreathing(scene, standing)
  useBlink(scene)
  const gem = useGemGlow(scene, staff)

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
      <GemHalo bone={gem.bone} center={gem.center} material={gem.haloMaterial} haloRef={gem.haloRef} />
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
