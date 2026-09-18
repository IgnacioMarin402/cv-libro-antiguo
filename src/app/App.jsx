import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import { configureScene } from './scene/renderer'
import { CAMERA, SHOTS } from '@/features/camera'

export default function App() {
  return (
    <div className="scene-wrap">
      <Canvas
        style={{ animation: 'fadeIn 1.2s ease' }}
        shadows="soft"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ ...CAMERA, position: SHOTS.intro.position.toArray() }}
        onCreated={configureScene}
      >
        <Scene />
      </Canvas>
      <div className="vignette" />
      <div className="hint">Arrastra para observar · Haz clic en la tapa para abrir el manuscrito</div>
    </div>
  )
}
