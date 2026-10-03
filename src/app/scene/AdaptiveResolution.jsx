import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { WINDOW_FRAMES, median, nextDpr } from './resolution'

// Lowers the canvas's resolution while the GPU can't hold the frame rate
// (see resolution.js). Only once `active`: the loading screen's
// frames, uploading the room, say nothing about the room's.
export default function AdaptiveResolution({ active }) {
  const setDpr = useThree((state) => state.setDpr)
  const frames = useRef([])

  useFrame((state, delta) => {
    if (!active) return
    frames.current.push(delta * 1000)
    if (frames.current.length < WINDOW_FRAMES) return
    const dpr = state.viewport.dpr
    const next = nextDpr(dpr, median(frames.current))
    frames.current = []
    if (next !== dpr) setDpr(next)
  })

  return null
}
