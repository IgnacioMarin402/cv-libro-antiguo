import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  loopOffset,
  rock,
  beatScale,
  emberBreath,
  nearFade,
  loveScale,
  loveSpin,
  loveFlare,
  LOVE_FLARE,
  HALO_OPACITY,
  HOVER_GLOW,
} from '../domain/heart'

// The heart's life from frame to frame: its lap round its spot, its beat,
// its face turned to the visitor, and what a click sets off. Returns the
// ref for the group that carries the whole heart and its halo, the hover
// flag the pointer handlers write, and love() to play the click.
export function useHeartMotion({ ember, halo }) {
  const heart = useRef()
  const hovered = useRef(false)
  const lovedAt = useRef(-Infinity)
  const clock = useThree((state) => state.clock)
  const world = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera }) => {
    const group = heart.current
    if (!group) return
    const t = clock.elapsedTime
    const since = t - lovedAt.current

    group.position.set(...loopOffset(t))
    group.parent.localToWorld(world.copy(group.position))
    const fade = nearFade(world.distanceTo(camera.position))
    group.visible = fade > 0.01

    // Turned about the vertical only, so it stays upright however high the
    // visitor looks down from.
    const facing = Math.atan2(camera.position.x - world.x, camera.position.z - world.z)
    group.rotation.y = facing + rock(t) + loveSpin(since)
    group.scale.setScalar(beatScale(t) * loveScale(since) * fade)

    // The ember isn't tone mapped, so past 1 its colours brighten until they
    // clip: the click's flare burns it hot and lets it cool back to the
    // gradient.
    const flare = 1 + LOVE_FLARE * loveFlare(since)
    ember.color.setScalar(emberBreath(t) * flare)
    halo.opacity = HALO_OPACITY * (hovered.current ? HOVER_GLOW : 1) * flare
  })

  const love = () => {
    lovedAt.current = clock.elapsedTime
  }

  return { heart, hovered, love }
}
