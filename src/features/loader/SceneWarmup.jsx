import { useSceneWarmup } from './hooks/useSceneWarmup'

// The loading screen's half that lives inside the canvas, where the
// renderer is: waits for the loaders, then puts the room on the GPU.
export default function SceneWarmup({ progressRef, onReady }) {
  useSceneWarmup(progressRef, onReady)
  return null
}
