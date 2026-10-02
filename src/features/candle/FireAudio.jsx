import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Loops a crackling-fire ambience anchored at the flame. Loads immediately,
// but only calls .play() after the visitor's first pointer interaction —
// browsers refuse to start audio before a user gesture.
//
// The defaults are the candle's. A bigger fire is heard from further off:
// `refDistance` is how near the full volume holds before it starts to
// fall, and `maxDistance` where it stops falling. `offset` is where in the
// loop it starts, as a fraction of it, so two fires playing the one file
// from the same click don't crackle in unison.
export default function FireAudio({
  position = [0, 0, 0],
  url = '/audio/fire-ambience.mp3',
  volume = 0.5,
  refDistance = 0.4,
  maxDistance = 4,
  offset = 0,
}) {
  const { camera, gl } = useThree()
  const anchorRef = useRef()

  useEffect(() => {
    const listener = new THREE.AudioListener()
    camera.add(listener)

    const sound = new THREE.PositionalAudio(listener)
    sound.setRefDistance(refDistance)
    sound.setRolloffFactor(1.4)
    sound.setMaxDistance(maxDistance)
    sound.setLoop(true)
    sound.setVolume(volume)
    anchorRef.current.add(sound)

    new THREE.AudioLoader().load(url, (buffer) => {
      sound.offset = buffer.duration * offset
      sound.setBuffer(buffer)
    })

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
  }, [camera, gl, url, volume, refDistance, maxDistance, offset])

  return <group ref={anchorRef} position={position} />
}
