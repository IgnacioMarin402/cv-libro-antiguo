import { useEffect, useMemo } from 'react'
import { addAfterEffect, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FRAMING } from '../domain/beer'

// Where the way back hangs: off the framing's top-left corner, its middle
// 8% of the framing down from the top, as the portrait's does off its
// frame; above that corner when there's no room beside it. In screen
// pixels, the gap to it and the least kept from the screen's edge.
const DROP = 0.08
const GAP_PX = 14
const EDGE_PX = 16

// Places the way back (`button`, see shared/ui/BackButton) beside the
// tankard as the camera sees it, and shows it once the lens has arrived
// (`arrivedSince`, see useLensArrived). After each frame is drawn, for the
// reason the portrait's is (see features/portrait's useWayBack); and only
// while the tankard is looked at, since the button is shared.
export function useWayBack({ focused, root, arrivedSince, button }) {
  const get = useThree((state) => state.get)
  const point = useMemo(() => new THREE.Vector3(), [])

  useEffect(
    () =>
      addAfterEffect(() => {
        const el = button?.current
        if (!focused || !el) return
        const shown = arrivedSince.current !== null && !!root.current
        const state = shown ? 'true' : 'false'
        if (el.dataset.shown !== state) el.dataset.shown = state
        if (!shown) return

        const { camera, size } = get()
        const [cx, cy, cz] = FRAMING.center
        const half = FRAMING.size / 2
        const onScreen = (x, y) => {
          point.set(cx + x, cy + y, cz).applyMatrix4(root.current.matrixWorld).project(camera)
          return [((point.x + 1) / 2) * size.width, ((1 - point.y) / 2) * size.height]
        }
        const [sideX, sideY] = onScreen(-half, half - DROP * FRAMING.size)
        let x = sideX - GAP_PX - el.offsetWidth
        let y = sideY - el.offsetHeight / 2
        if (x < EDGE_PX) {
          const [cornerX, cornerY] = onScreen(-half, half)
          x = Math.max(EDGE_PX, cornerX)
          y = cornerY - GAP_PX - el.offsetHeight
        }
        el.style.transform = `translate(${x}px, ${y}px)`
      }),
    [get, focused, root, arrivedSince, button, point]
  )
}
