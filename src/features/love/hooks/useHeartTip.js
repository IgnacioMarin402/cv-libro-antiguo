import { useEffect, useMemo } from 'react'
import { addAfterEffect, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { HEART_WIDTH, HEART_ASPECT } from '../domain/heart'

// In screen pixels: the gap between the heart and its tip, the least the
// tip keeps from the screen's sides, and the band it stays out of at the
// top — the corner's row of buttons (18 px down, 36 tall).
const GAP_PX = 10
const EDGE_PX = 16
const TOP_PX = 64

// Half the heart's height, in its own space: its top and its point are this
// far over and under its middle, at whatever size it's drawn.
const HALF_HEIGHT = (HEART_WIDTH * HEART_ASPECT) / 2

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// Shows the heart's tip (`tip`, a DOM element over the canvas, see
// LoveHeartTip) while the pointer is on the heart (`hovered`), centred over
// it as the camera sees it — under it instead when the heart is too near
// the top of the screen for the tip to fit above. It follows the heart
// round its lap and through its swell.
//
// It runs after each frame is drawn, not in a useFrame: those run before
// the camera rig moves the camera, and the camera's matrices are only
// brought up to date by the render, so from a useFrame the tip would trail
// the heart by a frame whenever the room turns.
export function useHeartTip({ heart, hovered, tip }) {
  const get = useThree((state) => state.get)
  const point = useMemo(() => new THREE.Vector3(), [])

  useEffect(
    () =>
      addAfterEffect(() => {
        const el = tip?.current
        if (!el) return
        const group = heart.current
        const shown = !!group && group.visible && hovered.current
        const state = shown ? 'true' : 'false'
        if (el.dataset.shown !== state) el.dataset.shown = state
        if (!shown) return

        const { camera, size } = get()
        // A point of the heart, up its middle, on the canvas in CSS pixels.
        const onScreen = (y) => {
          point.set(0, y, 0).applyMatrix4(group.matrixWorld).project(camera)
          return [((point.x + 1) / 2) * size.width, ((1 - point.y) / 2) * size.height]
        }
        const width = el.offsetWidth
        const height = el.offsetHeight
        const [topX, topY] = onScreen(HALF_HEIGHT)
        let y = topY - GAP_PX - height
        if (y < TOP_PX) y = onScreen(-HALF_HEIGHT)[1] + GAP_PX
        const x = clamp(topX - width / 2, EDGE_PX, size.width - EDGE_PX - width)
        el.style.transform = `translate(${x}px, ${y}px)`
      }),
    [get, heart, hovered, tip, point]
  )
}
