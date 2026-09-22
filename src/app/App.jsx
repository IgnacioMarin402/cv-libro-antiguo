import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import { configureScene } from './scene/renderer'
import { CAMERA, SHOTS } from '@/features/camera'

// What the visitor can do right now, which is not the same before and after
// the book opens: an open book takes the keyboard and lets the lens much
// closer in (see features/camera).
const HINTS = {
  closed: 'Arrastra para observar · Haz clic en la tapa para abrir el manuscrito',
  open: 'WASD para desplazarte · Arrastra para girar · Rueda para acercarte · Clic para pasar página',
}

export default function App() {
  // Whether the book is open is the scene's one piece of shared state: the
  // book drives it, the camera reacts to it — and so does the line under
  // the canvas, which is outside the canvas, so it lives out here above both.
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="scene-wrap">
      {/* 'percentage' is PCFShadowMap. It used to be 'soft', but three has
          dropped PCFSoftShadowMap: 0.186 warns and falls back to
          PCFShadowMap anyway, so this is the same filter, minus the warning. */}
      <Canvas
        style={{ animation: 'fadeIn 1.2s ease' }}
        shadows="percentage"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ ...CAMERA, position: SHOTS.intro.position.toArray() }}
        onCreated={configureScene}
      >
        <Scene open={isOpen} onOpenChange={setIsOpen} />
      </Canvas>
      <div className="vignette" />
      <div className="hint">{isOpen ? HINTS.open : HINTS.closed}</div>
    </div>
  )
}
