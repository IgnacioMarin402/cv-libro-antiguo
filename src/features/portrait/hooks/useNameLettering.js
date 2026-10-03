import { useMemo } from 'react'
import * as THREE from 'three'
import { createNameTexture } from '../textures/nameTexture'
import { nameVertexShader, nameFragmentShader } from '../shaders/nameShader'
import {
  DOG_NAMES,
  NAME_SIZE,
  LETTER_HEAD,
  NAME_Z,
  FRONT_SOFTNESS,
  FRONT_SLANT,
  COOLING,
  GILT_DEEP,
  GILT_PALE,
  WRITING_LIGHT,
  HALO,
  HALO_REST,
  HALO_HOT,
  HALO_BLOOM,
  SHIMMER,
  BREATH,
  namePhase,
} from '../domain/names'

// The four names, each a plane carrying its own lettering, set where the
// domain puts it on the canvas, with the material that writes it. Built
// once, after the font is in (see components/DogNames). Lengths are in the
// frame's units; the shader's are the same lengths as shares of the plane.
//
// The material is built here and not as JSX, like every shader material in
// the scene: R3F copies a uniforms prop, and what's written into it every
// frame would never reach the shader (see candle/hooks/useFlame).
export function useNameLettering() {
  return useMemo(
    () =>
      DOG_NAMES.map((name, index) => {
        const lettering = createNameTexture(name.text)
        const width = lettering.width * NAME_SIZE
        const height = lettering.height * NAME_SIZE
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uMap: { value: lettering.texture },
            uFront: { value: 0 },
            uSoftness: { value: FRONT_SOFTNESS / width },
            uCooling: { value: COOLING / width },
            uSlant: { value: (FRONT_SLANT * height) / width },
            uLetters: { value: new THREE.Vector2(...lettering.letters) },
            uPresence: { value: 0 },
            uTime: { value: 0 },
            uPhase: { value: namePhase(index) },
            uGiltDeep: { value: new THREE.Color(...GILT_DEEP) },
            uGiltPale: { value: new THREE.Color(...GILT_PALE) },
            uWritingLight: { value: new THREE.Color(...WRITING_LIGHT) },
            uHalo: { value: new THREE.Color(...HALO) },
            uHaloStrength: { value: new THREE.Vector3(HALO_REST, HALO_HOT, HALO_BLOOM) },
            uShimmer: { value: new THREE.Vector4(SHIMMER.period, SHIMMER.sweep, SHIMMER.width / width, SHIMMER.gain) },
            uBreath: { value: new THREE.Vector2(BREATH.period, BREATH.depth) },
          },
          vertexShader: nameVertexShader,
          fragmentShader: nameFragmentShader,
          transparent: true,
          premultipliedAlpha: true,
          depthWrite: false,
        })
        // Where the letters start and end along the plane, from its left
        // edge; the front sets off far enough before the first that
        // nothing of the name — its halo leaning ahead with the slant —
        // shows until it does.
        const start = lettering.inset * width
        return {
          text: name.text,
          geometry: new THREE.PlaneGeometry(width, height),
          material,
          // The plane's middle, from where its line has to fall.
          position: [name.x, name.baseline + (lettering.baseline - lettering.height / 2) * NAME_SIZE, NAME_Z],
          left: name.x - width / 2,
          width,
          start,
          end: width - start,
          lead: FRONT_SOFTNESS + 0.5 * FRONT_SLANT * height,
          foot: name.baseline,
          head: name.baseline + LETTER_HEAD * NAME_SIZE,
        }
      }),
    []
  )
}
