import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { loadState } from '@/shared/three/loadTracker'
import { isSettled } from '../domain/loading'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

// Every texture the scene's materials use, whether or not the camera can
// see its object right now.
function sceneTextures(scene) {
  const found = new Set()
  const take = (value) => value?.isTexture && found.add(value)
  scene.traverse((object) => {
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      if (!material) continue
      Object.values(material).forEach(take)
      if (material.uniforms) Object.values(material.uniforms).forEach((u) => take(u.value))
    }
  })
  take(scene.environment)
  take(scene.background)
  return [...found]
}

// Gets the whole room onto the GPU while the loading screen still covers
// it. Left to itself, three compiles a material and uploads a texture the
// first time it's drawn — which for an object behind the camera is the
// first time the visitor turns round, and for a 4096 px map is a visible
// hitch. So once the loaders have gone quiet: compile every material, then
// upload every texture, one per frame so the screen keeps moving.
//
// Writes its 0..1 into `progressRef` for the loading screen (null until it
// starts) and calls onReady once it's done.
export function useSceneWarmup(progressRef, onReady) {
  const { gl, scene, camera } = useThree()
  const readyRef = useRef(onReady)
  readyRef.current = onReady

  useEffect(() => {
    let cancelled = false

    async function warmUp() {
      while (!isSettled(loadState(), performance.now())) {
        await wait(100)
        if (cancelled) return
      }
      progressRef.current = 0
      await gl.compileAsync(scene, camera)
      if (cancelled) return

      const textures = sceneTextures(scene)
      for (let i = 0; i < textures.length; i++) {
        gl.initTexture(textures[i])
        progressRef.current = (i + 1) / textures.length
        await nextFrame()
        if (cancelled) return
      }
      progressRef.current = 1
      readyRef.current()
    }

    warmUp()
    return () => {
      cancelled = true
    }
  }, [gl, scene, camera, progressRef])
}
