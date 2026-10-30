import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createBeerGeometry, createFoamGeometry } from '../geometry/beerGeometry'
import { createFoamBumpTexture } from '../textures/foamTexture'
import { pour, AXIS, BEER_COLOR, FOAM_COLOR } from '../domain/beer'

// The tankard filling (see domain/beer): it starts the first time the
// visitor has arrived in front of it (`arrivedSince`, the clock's seconds,
// see useLensArrived) and happens once a page load — from then on it stands
// full. `shaker` is the group that shakes, the tankard and its beer in it,
// pivoting at its foot.
export function usePour(arrivedSince) {
  const shaker = useRef()
  const beer = useRef()
  const foam = useRef()
  const pouredAt = useRef(null)

  const beerGeometry = useMemo(() => createBeerGeometry(), [])
  const foamGeometry = useMemo(() => createFoamGeometry(), [])
  // The beer glossy and dark, a liquid seen from above in a copper cup; the
  // foam matte, its bubbles in relief.
  const beerMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: BEER_COLOR, roughness: 0.15 }), [])
  const foamMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: FOAM_COLOR, roughness: 0.95, bumpMap: createFoamBumpTexture(), bumpScale: 2 }),
    []
  )

  useFrame(({ clock }) => {
    if (pouredAt.current === null && arrivedSince.current !== null) pouredAt.current = clock.elapsedTime
    const since = pouredAt.current === null ? null : clock.elapsedTime - pouredAt.current
    const { tilt, roll, turn, hop, level, head } = pour(since)

    if (shaker.current) {
      shaker.current.rotation.set(tilt, turn, roll)
      shaker.current.position.y = hop
    }
    if (beer.current) {
      beer.current.visible = level !== null
      if (level !== null) beer.current.position.set(AXIS[0], level, AXIS[2])
    }
    if (foam.current) {
      foam.current.visible = head > 0.001
      if (foam.current.visible) {
        foam.current.position.set(AXIS[0], level, AXIS[2])
        foam.current.scale.set(1, head, 1)
      }
    }
  })

  return { shaker, beer, foam, beerGeometry, foamGeometry, beerMaterial, foamMaterial }
}
