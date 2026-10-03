import { useEffect, useMemo } from 'react'
import { addAfterEffect, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FRAME } from '../domain/portrait'

// Where the way back hangs, off the frame's top-left corner and outside it:
// to its left, its middle 8% of the frame's height down from the top —
// where it was asked for, by the corner, rather than off with the heart
// counter where it went unseen. On a screen with no room there, a phone
// held upright where the frame takes 80% of the width, it sits just above
// the corner instead. In screen pixels: the gap to the frame, and the least
// it keeps from the screen's edge.
const DROP = 0.08
const GAP_PX = 14
const EDGE_PX = 16

// Places the way back (`button`, a DOM element over the canvas, see
// PortraitBack) beside the portrait's frame as the camera sees it, and
// shows it once the lens stands square in front of the painting
// (`squareSince`, see useLensSquare): it arrives with the names, and stays
// with the frame if the window changes size.
//
// It runs after each frame is drawn, not in a useFrame: those run before
// the camera rig moves the camera, and the camera's matrices are only
// brought up to date by the render itself, so from a useFrame the button
// sat where the frame had been a frame earlier. The same placement for the
// book's magnifier, which follows a camera the visitor orbits, was off by
// up to 119 px (measured) and read as the button shaking.
export function useWayBack({ focused, root, squareSince, button }) {
  const get = useThree((state) => state.get)
  const point = useMemo(() => new THREE.Vector3(), [])

  useEffect(
    () =>
      addAfterEffect(() => {
        const el = button?.current
        if (!el) return
        const shown = focused && squareSince.current !== null && !!root.current
        const state = shown ? 'true' : 'false'
        if (el.dataset.shown !== state) el.dataset.shown = state
        if (!shown) return

        const { camera, size } = get()
        // A point of the frame (its own units) on the canvas, in CSS pixels.
        const onScreen = (x, y) => {
          point.set(x, y, FRAME.front).applyMatrix4(root.current.matrixWorld).project(camera)
          return [((point.x + 1) / 2) * size.width, ((1 - point.y) / 2) * size.height]
        }
        const width = el.offsetWidth
        const height = el.offsetHeight
        const [sideX, sideY] = onScreen(-FRAME.halfWidth, FRAME.top - DROP * (FRAME.top - FRAME.bottom))
        let x = sideX - GAP_PX - width
        let y = sideY - height / 2
        if (x < EDGE_PX) {
          const [cornerX, cornerY] = onScreen(-FRAME.halfWidth, FRAME.top)
          x = cornerX
          y = cornerY - GAP_PX - height
        }
        el.style.transform = `translate(${x}px, ${y}px)`
      }),
    [get, focused, root, squareSince, button, point]
  )
}
