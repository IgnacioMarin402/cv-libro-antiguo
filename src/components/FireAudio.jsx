import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Loops a crackling-fire ambience anchored at the flame. Loads immediately,
// but only calls .play() after the visitor's first pointer interaction —
// browsers refuse to start audio before a user gesture.
export default function FireAudio({ position = [0.34, 0.75, 0.42], url = '/audio/fire-ambience.mp3', volume = 0.5 }) {
  const { camera, gl } = useThree()
  const anchorRef = useRef()

  useEffect(() => {
    const listener = new THREE.AudioListener()
    camera.add(listener)

    const sound = new THREE.PositionalAudio(listener)
    sound.setRefDistance(0.4)
    sound.setRolloffFactor(1.4)
    sound.setMaxDistance(4)
    sound.setLoop(true)
    sound.setVolume(volume)
    anchorRef.current.add(sound)

    new THREE.AudioLoader().load(url, (buffer) => sound.setBuffer(buffer))

    const canvas = gl.domElement
    const start = () => {
      if (listener.context.state === 'suspended') listener.context.resume()
      if (sound.buffer && !sound.isPlaying) sound.play()
    }
    canvas.addEventListener('pointerdown', start, { once: true })

    return () => {
      canvas.removeEventListener('pointerdown', start)
      if (sound.isPlaying) sound.stop()
      anchorRef.current?.remove(sound)
      camera.remove(listener)
    }
  }, [camera, gl, url, volume])

  return <group ref={anchorRef} position={position} />
}
