import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  EMBER_COUNT,
  EMBER_ORANGE,
  EMBER_YELLOW,
  EMBER_HOT,
  spawnEmber,
  emberAt,
} from '../domain/embers'
import { emberVertexShader, emberFragmentShader } from '../shaders/emberShader'

// Keeps EMBER_COUNT orbs going over the brew: ages them every frame, writes
// where each is and how much of it shows into the points' attributes, and
// spawns a fresh one wherever one has burned out. They start at random
// ages, so the stream is already going on the first frame instead of all
// of them welling up at once.
export function useEmbers() {
  const embers = useMemo(
    () =>
      Array.from({ length: EMBER_COUNT }, () => {
        const ember = spawnEmber()
        return { ember, age: Math.random() * ember.life }
      }),
    []
  )

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(EMBER_COUNT * 3), 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(EMBER_COUNT), 1))
    g.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(EMBER_COUNT), 1))
    g.setAttribute('aHue', new THREE.BufferAttribute(new Float32Array(EMBER_COUNT), 1))
    return g
  }, [])

  // Built here, not as a <shaderMaterial uniforms={...}>: R3F copies a
  // uniforms prop, and the scale written below every frame would never
  // reach the shader (see candle/hooks/useFlame).
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uScale: { value: 1 },
          uOrange: { value: new THREE.Color(...EMBER_ORANGE) },
          uYellow: { value: new THREE.Color(...EMBER_YELLOW) },
          uHot: { value: new THREE.Color(...EMBER_HOT) },
        },
        vertexShader: emberVertexShader,
        fragmentShader: emberFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  )

  useFrame((state, delta) => {
    const { position, aSize, aAlpha, aHue } = geometry.attributes
    for (let i = 0; i < EMBER_COUNT; i++) {
      const slot = embers[i]
      slot.age += delta
      if (slot.age > slot.ember.life) {
        slot.ember = spawnEmber()
        slot.age = 0
      }
      const { x, y, z, alpha } = emberAt(slot.ember, slot.age)
      position.setXYZ(i, x, y, z)
      aSize.setX(i, slot.ember.size)
      aAlpha.setX(i, alpha)
      aHue.setX(i, slot.ember.hue)
    }
    position.needsUpdate = true
    aSize.needsUpdate = true
    aAlpha.needsUpdate = true
    aHue.needsUpdate = true

    // Pixels per metre at unit depth, for the drawing buffer as it is now.
    const height = state.size.height * state.viewport.dpr
    material.uniforms.uScale.value = height / (2 * Math.tan(THREE.MathUtils.degToRad(state.camera.fov) / 2))
  })

  return { geometry, material }
}
