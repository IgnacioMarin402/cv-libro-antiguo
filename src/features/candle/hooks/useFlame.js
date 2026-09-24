import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FLAME, LIGHT_LEAN, flameAt } from '../domain/flame'
import { FLAME_SCALE } from '../domain/candle'
import { flameVertexShader, flameFragmentShader } from '../shaders/flameShader'

const UP = new THREE.Vector3(0, 1, 0)

// A flame burns around its wick, so from any side its near half is in front
// of it. The card stands in for the whole flame, so it's brought forward
// past the wick's radius, by this many radii: through the wick's middle,
// the wick hid the flame's base.
const NUDGE_RADII = 1.5

// How much of the glow's reach the lean carries: it sits at the flame's
// middle, where the bend has moved it a quarter as far as the tip.
const GLOW_LEAN = 0.25
const GLOW_OPACITY = 0.85

// Drives the flame card, its glow and — if the flame carries one — its
// candle's light from one reading of the draft per frame (see
// domain/flame). `phase` (seconds) takes that reading earlier or later, so
// flames burning side by side don't move in step; `wickRadius` is in
// metres.
//
// The card turns about the flame's own upright axis to face the camera,
// rather than copying the camera's rotation the way a sprite does: seen
// from the table's height the flame stands up straight, and the draft
// leans it in the room, not on the screen. Only when the visitor looks
// down from high above does the axis tip toward the camera's up — a card
// kept strictly upright would be seen end-on from overhead and vanish.
export function useFlame({ wickRadius, phase = 0 }) {
  const nudge = (wickRadius / FLAME_SCALE) * NUDGE_RADII
  const cardRef = useRef()
  const glowRef = useRef()
  const lightRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBrightness: { value: 1 },
    uFlutter: { value: 0 },
    uHeight: { value: FLAME.height },
    uWidth: { value: FLAME.width },
    uAxis: { value: new THREE.Vector3(0, 1, 0) },
    uSide: { value: new THREE.Vector3(1, 0, 0) },
    uLean: { value: new THREE.Vector3() },
    uNudge: { value: new THREE.Vector3() },
  }), [])
  // Built here, not as a <shaderMaterial uniforms={...}> in JSX: R3F copies
  // a uniforms prop into objects of its own, so the numbers written below
  // every frame never reached the shader — the first flame's noise sat
  // frozen at time 0 for exactly that reason. Only the vectors, shared by
  // reference, got through.
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms,
    vertexShader: flameVertexShader,
    fragmentShader: flameFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), [uniforms])
  const scratch = useMemo(() => ({ eye: new THREE.Vector3(), camUp: new THREE.Vector3() }), [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase
    const f = flameAt(t)
    const { eye, camUp } = scratch
    const { value: axis } = uniforms.uAxis
    const { value: side } = uniforms.uSide

    // The camera and its up, in the card's own space.
    const card = cardRef.current
    card.worldToLocal(camUp.copy(state.camera.up).applyQuaternion(state.camera.quaternion).add(state.camera.position))
    card.worldToLocal(eye.copy(state.camera.position))
    camUp.sub(eye).normalize()
    eye.y -= FLAME.height / 2
    eye.normalize()

    // Upright until the view is steeper than ~37°, then easing over to the
    // camera's up, all the way there by ~78°.
    const steep = THREE.MathUtils.smoothstep(Math.abs(eye.y), 0.6, 0.98)
    axis.copy(UP).lerp(camUp, steep).normalize()
    side.crossVectors(axis, eye).normalize()
    uniforms.uNudge.value.copy(eye).multiplyScalar(nudge)

    uniforms.uLean.value.set(f.leanX, 0, f.leanZ)
    uniforms.uHeight.value = FLAME.height * f.stretch
    uniforms.uTime.value = t
    uniforms.uFlutter.value = f.flutter
    uniforms.uBrightness.value = f.brightness

    const light = lightRef.current
    if (light) {
      light.intensity = f.light
      light.position.x = f.leanX * LIGHT_LEAN
      light.position.z = f.leanZ * LIGHT_LEAN
    }

    const glow = glowRef.current
    glow.position.x = f.leanX * GLOW_LEAN
    glow.position.z = f.leanZ * GLOW_LEAN
    glow.material.opacity = GLOW_OPACITY * f.brightness
  })

  return { cardRef, glowRef, lightRef, material }
}
