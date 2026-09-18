import * as THREE from 'three'
import { createEnvironmentTexture } from './environmentTexture'

// How the canvas itself renders: filmic tone mapping at a warm exposure,
// plus the haze and the environment map that give the candlelight somewhere
// to fall off into. Applied once, when the canvas is created.

export const FOG = { color: 0x2a2015, density: 0.022 }
export const EXPOSURE = 1.4

export function configureScene({ gl, scene }) {
  gl.toneMapping = THREE.ACESFilmicToneMapping
  gl.toneMappingExposure = EXPOSURE
  gl.outputColorSpace = THREE.SRGBColorSpace
  scene.fog = new THREE.FogExp2(FOG.color, FOG.density)
  scene.environment = createEnvironmentTexture()
}
