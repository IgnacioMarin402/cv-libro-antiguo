import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createGemMask, createHaloTexture } from '../textures/gemTextures'
import { gemCenter } from '../geometry/gemCenter'
import { GEM_BONE, GLOW_PEAK, glowEnvelope } from '../domain/gem'

// The gem lighting up with the staff: its own texels glow through the
// material's emissive map, and a halo sprite rides on the bone that holds
// it. Both follow the staff clip — how far through it is, and how much of
// the pose it makes up while it blends in and out. Returns what the halo
// needs to be mounted.
export function useGemGlow(scene, staff) {
  const gem = useMemo(() => {
    let mesh
    scene.traverse((o) => {
      if (o.isSkinnedMesh) mesh = o
    })
    const bone = mesh.skeleton.getBoneByName(GEM_BONE)
    const { texture, weightAt } = createGemMask(mesh.material.map)
    return { mesh, bone, mask: texture, center: gemCenter(mesh, bone, weightAt) }
  }, [scene])

  const haloMaterial = useMemo(() => new THREE.SpriteMaterial({
    map: createHaloTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    // Out of the tone mapping, which compresses it like everything else: it
    // is light added over the scene, not a lit surface.
    toneMapped: false,
    opacity: 0,
  }), [])
  const haloRef = useRef()

  useLayoutEffect(() => {
    const { material } = gem.mesh
    material.emissive.set(0xffffff)
    material.emissiveMap = gem.mask
    material.emissiveIntensity = 0
    material.needsUpdate = true
  }, [gem])

  useFrame(() => {
    const glow = staff.isScheduled() ? glowEnvelope(staff.time) * staff.getEffectiveWeight() : 0
    gem.mesh.material.emissiveIntensity = GLOW_PEAK * glow
    haloMaterial.opacity = glow
    if (haloRef.current) haloRef.current.visible = glow > 0
  })

  return { bone: gem.bone, center: gem.center, haloMaterial, haloRef }
}
