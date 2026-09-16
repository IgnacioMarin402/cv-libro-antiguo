import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Scene from './Scene'
import { createEnvironmentTexture } from './utils/textures'

export default function App() {
  return (
    <div className="scene-wrap">
      <Canvas
        style={{ animation: 'fadeIn 1.2s ease' }}
        shadows="soft"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: 38, near: 0.05, far: 50, position: [0.15, 1.9, 2.5] }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.4
          gl.outputColorSpace = THREE.SRGBColorSpace
          scene.fog = new THREE.FogExp2(0x2a2015, 0.022)
          scene.environment = createEnvironmentTexture()
        }}
      >
        <Scene />
      </Canvas>
      <div className="vignette" />
      <div className="hint">Arrastra para observar el manuscrito</div>
    </div>
  )
}
