import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createHeartGeometry, createHeartTexture } from '@/features/love'
import { createCookieGeometry } from '../geometry/cookieGeometry'
import { createCookieTexture } from '../textures/cookieTexture'
import { headPose, HEAD_PIVOT } from '../domain/head'
import { MOUTH_TARGET, SNAP_OPEN } from '../domain/jaw'
import { THROW_FROM, FLIGHT, SPINS, flightPoint, HEARTS, HEART_SCALE, heartAt } from '../domain/cookie'

// A cookie thrown into Shourdo's mouth: it flies from just under the lens
// to the middle of his open mouth, which opens to meet it and snaps shut
// on it, and two hearts rise off his head for it.
//
// The cookie and the hearts fly in the room, in metres, so they're drawn
// outside the bust's own group, which is in the model's units; `root` is
// that group, to find his mouth in the room. `snap` is the jaw's (see
// useBustMotion).
//
// throwCookie() throws one, and says false if one is still in the air.
export function useCookieThrow({ root, snap }) {
  const camera = useThree((state) => state.camera)
  const clock = useThree((state) => state.clock)
  const cookie = useRef()
  const hearts = useRef([])

  const cookieGeometry = useMemo(() => createCookieGeometry(), [])
  const cookieMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: createCookieTexture(), roughness: 0.85 }), [])
  // The love heart's shape and light, drawn as it draws them: unlit and out
  // of the tone mapping. One material each, to fade apart.
  const heartGeometry = useMemo(() => createHeartGeometry(), [])
  const heartMaterials = useMemo(() => {
    const map = createHeartTexture()
    return HEARTS.map(
      () => new THREE.MeshBasicMaterial({ map, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    )
  }, [])

  const flight = useRef(null)
  const heartsAt = useRef(-Infinity)
  const scratch = useMemo(
    () => ({
      v: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      euler: new THREE.Euler(0, 0, 0, 'YXZ'),
      axis: new THREE.Vector3(),
    }),
    []
  )

  // His mouth in the room at a time on the clock: the head turns it about
  // the neck as the shader turns the mesh (see domain/head), all of it — the
  // mouth is well over the line where the head's share runs out.
  const mouthAt = (time) => {
    const { nod, turn, tilt } = headPose(time)
    scratch.q.setFromEuler(scratch.euler.set(nod, turn, tilt))
    const p = new THREE.Vector3(...MOUTH_TARGET).sub(scratch.v.set(...HEAD_PIVOT))
    p.applyQuaternion(scratch.q).add(scratch.v)
    return root.current.localToWorld(p).toArray()
  }

  const throwCookie = () => {
    if (flight.current || !root.current) return false
    const start = clock.elapsedTime
    const arrival = start + FLIGHT
    const from = new THREE.Vector3(THROW_FROM.right, -THROW_FROM.down, -THROW_FROM.ahead)
    camera.localToWorld(from)
    flight.current = {
      from: from.toArray(),
      to: mouthAt(arrival),
      start,
      axis: scratch.axis.set(1, 0, 0.4).normalize().clone(),
    }
    // Wide open as it arrives, shut on it right after; the hearts once
    // it's shut.
    snap(arrival - SNAP_OPEN)
    heartsAt.current = arrival + 0.15
    return true
  }

  useFrame(() => {
    const now = clock.elapsedTime
    const mesh = cookie.current
    if (mesh) {
      const f = flight.current
      const t = f ? (now - f.start) / FLIGHT : 1
      mesh.visible = t < 1
      if (f && t >= 1) flight.current = null
      if (mesh.visible) {
        mesh.position.fromArray(flightPoint(f.from, f.to, t))
        mesh.quaternion.setFromAxisAngle(f.axis, t * SPINS * Math.PI * 2)
      }
    }

    hearts.current.forEach((heart, i) => {
      if (!heart) return
      const { rise, sway, opacity } = heartAt(now - heartsAt.current - HEARTS[i].delay, i)
      heart.visible = opacity > 0
      if (!heart.visible || !root.current) return
      heartMaterials[i].opacity = opacity
      root.current.localToWorld(heart.position.set(...HEARTS[i].from))
      heart.position.y += rise
      heart.position.x += sway
      // Facing the lens, wherever it stands.
      heart.quaternion.copy(camera.quaternion)
    })
  })

  return { cookie, cookieGeometry, cookieMaterial, hearts, heartGeometry, heartMaterials, throwCookie }
}
