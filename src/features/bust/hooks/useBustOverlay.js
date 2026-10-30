import { useEffect, useMemo } from 'react'
import { addAfterEffect, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Where the two buttons over the canvas hang beside him, in the model's
// units: the way back off the left of his head, by his ear's top (as the
// portrait's hangs off its frame's top-left corner); the cookie off the
// right of his face, level with his mouth, where it's going.
const BACK_AT = [-17, 80]
const COOKIE_AT = [21, 55]
// When there's no room beside his head — a phone held upright, where the
// framing takes 80% of the width — the way back sits over his head's
// top-left, and the cookie on the cape, under the medallion: under his
// chin, at y = 46, it covered it.
const BACK_ABOVE = [-17, 86]
const COOKIE_BELOW = [5, 34]
// And the plane they're projected from: the face of the framing.
const FACE_Z = 44

// In screen pixels: the gap to him, and the least kept from the screen's
// edge.
const GAP_PX = 14
const EDGE_PX = 16

// Places the way back (`back`, see shared/ui/BackButton) and the cookie
// (`cookie`, see CookieButton) beside him as the camera sees him, and shows
// them once the lens stands square in front of him (`arrivedSince`, see
// useLensArrived).
//
// After each frame is drawn, not in a useFrame, for the reason the
// portrait's way back is (see features/portrait's useWayBack): from a
// useFrame they trail the camera by a frame. Only while he's being looked
// at: the way back is the portrait's too, and it writes it then.
export function useBustOverlay({ focused, root, arrivedSince, back, cookie }) {
  const get = useThree((state) => state.get)
  const point = useMemo(() => new THREE.Vector3(), [])

  useEffect(
    () =>
      addAfterEffect(() => {
        if (!focused) return
        const shown = arrivedSince.current !== null && !!root.current
        const state = shown ? 'true' : 'false'
        for (const el of [back?.current, cookie?.current]) {
          if (el && el.dataset.shown !== state) el.dataset.shown = state
        }
        if (!shown) return

        const { camera, size } = get()
        const onScreen = ([x, y]) => {
          point.set(x, y, FACE_Z).applyMatrix4(root.current.matrixWorld).project(camera)
          return [((point.x + 1) / 2) * size.width, ((1 - point.y) / 2) * size.height]
        }

        const backEl = back?.current
        if (backEl) {
          const [sideX, sideY] = onScreen(BACK_AT)
          let x = sideX - GAP_PX - backEl.offsetWidth
          let y = sideY - backEl.offsetHeight / 2
          if (x < EDGE_PX) {
            const [aboveX, aboveY] = onScreen(BACK_ABOVE)
            x = Math.max(EDGE_PX, aboveX)
            y = aboveY - GAP_PX - backEl.offsetHeight
          }
          backEl.style.transform = `translate(${x}px, ${y}px)`
        }

        const cookieEl = cookie?.current
        if (cookieEl) {
          const [sideX, sideY] = onScreen(COOKIE_AT)
          let x = sideX + GAP_PX
          let y = sideY - cookieEl.offsetHeight / 2
          if (x + cookieEl.offsetWidth > size.width - EDGE_PX) {
            const [belowX, belowY] = onScreen(COOKIE_BELOW)
            x = belowX - cookieEl.offsetWidth / 2
            y = belowY
          }
          cookieEl.style.transform = `translate(${x}px, ${y}px)`
        }
      }),
    [get, focused, root, arrivedSince, back, cookie, point]
  )
}
