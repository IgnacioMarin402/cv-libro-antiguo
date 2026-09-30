import { useMemo } from 'react'
import * as THREE from 'three'
import HeartBurst from './components/HeartBurst'
import { createRimGeometry, createEmberGeometry, createHitGeometry } from './geometry/heartGeometry'
import { createEmberTexture, createHaloTexture } from './textures/glowTextures'
import { useHeartMotion } from './hooks/useHeartMotion'
import { useHeartBurst } from './hooks/useHeartBurst'
import { HEART_ASPECT, RIM_COLOR, RIM_OPACITY, HALO_SIZE, HALO_OPACITY } from './domain/heart'

// Only the flat hit shape answers the pointer: the halo is three times the
// heart's size and would catch clicks meant for the book behind it.
const noRaycast = () => null

// The heart floating by the candle — the counter's heart, in the room: a
// gold hairline, and an ember inside it. A click plays its animation every
// time and calls onLove, which counts it once per visitor (see useLove).
//
// `position` is the middle of its lap; the heart circles round it.
export default function LoveHeart({ position, onLove }) {
  const rim = useMemo(() => createRimGeometry(), [])
  const emberShape = useMemo(() => createEmberGeometry(), [])
  const hit = useMemo(() => createHitGeometry(), [])

  // Both drawn as the counter draws them — flat colour, the same on screen
  // as on the SVG: unlit, since the ember is a light and the hairline a
  // line, and out of the tone mapping, which would dull the gradient's
  // white-gold and deepen its orange.
  const rimMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: RIM_COLOR,
    transparent: true,
    opacity: RIM_OPACITY,
    toneMapped: false,
  }), [])
  const ember = useMemo(() => new THREE.MeshBasicMaterial({
    map: createEmberTexture(HEART_ASPECT),
    toneMapped: false,
  }), [])
  // Never drawn, still hit: a material that doesn't render leaves the mesh
  // in the raycast.
  const hitMaterial = useMemo(() => new THREE.MeshBasicMaterial({ visible: false }), [])
  // Out of the tone mapping too, like the gem's halo: it is light added
  // over the scene, not a lit surface.
  const halo = useMemo(() => new THREE.SpriteMaterial({
    map: createHaloTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
    opacity: HALO_OPACITY,
  }), [])

  const motion = useHeartMotion({ ember, halo })
  const burst = useHeartBurst()

  const handleClick = (e) => {
    e.stopPropagation()
    motion.love()
    burst.fire(motion.heart.current.position.toArray())
    onLove?.()
  }
  const handlePointerOver = (e) => {
    e.stopPropagation()
    motion.hovered.current = true
    document.body.style.cursor = 'pointer'
  }
  const handlePointerOut = () => {
    motion.hovered.current = false
    document.body.style.cursor = 'auto'
  }

  // No shadows: it glows, and a dark heart thrown across the table by the
  // candle beside it would say it doesn't.
  return (
    <group position={position}>
      <group ref={motion.heart}>
        <mesh geometry={rim} material={rimMaterial} />
        <mesh geometry={emberShape} material={ember} />
        <mesh
          geometry={hit}
          material={hitMaterial}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
        <sprite material={halo} scale={[HALO_SIZE, HALO_SIZE, 1]} raycast={noRaycast} />
      </group>
      <HeartBurst points={burst.points} burst={burst.burst} material={burst.material} />
    </group>
  )
}
