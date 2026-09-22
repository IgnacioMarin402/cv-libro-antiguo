import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STANDING_CLIP, STAFF_CLIP, WAVE_CLIP, WAVE_START, CLIP_BLEND } from '../domain/wizard'

// The sound the spell is cast with ("appear magic", freesound_gamestudio,
// 384915).
const SPELL_URL = '/audio/appear-magic.mp3'

// Every change of clip is a blend: whatever is showing fades out while the
// next one fades in, over the same time, so their weights keep adding up to
// one. Below one, three fills the rest in with the rest pose — the T-pose.
function blendTo(actions, next, from = 0) {
  for (const action of Object.values(actions)) if (action !== next && action.isScheduled()) action.fadeOut(CLIP_BLEND)
  next.reset()
  next.time = from
  next.fadeIn(CLIP_BLEND).play()
}

// What the figure is doing, frame by frame: standing, and the two gestures
// it breaks into — the staff toward the book when the book opens, with its
// sound, and a wave when it is clicked. Returns the click handler.
export function useWizardClips(scene, animations, open) {
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene])
  const actions = useMemo(() => {
    const clip = (name) => mixer.clipAction(animations.find((c) => c.name.startsWith(name)))
    // The gestures play once through, holding their last frame while they
    // blend back out.
    const once = (name) => {
      const action = clip(name)
      action.setLoop(THREE.LoopOnce, 1)
      action.clampWhenFinished = true
      return action
    }
    return { standing: clip(STANDING_CLIP), staff: once(STAFF_CLIP), wave: once(WAVE_CLIP) }
  }, [mixer, animations])
  const spell = useMemo(() => new Audio(SPELL_URL), [])
  // The gesture in progress, if any. Only the spell interrupts one: the book
  // opening is the scene's own moment.
  const gesture = useRef(null)

  // A layout effect, so the standing clip is already playing when the first
  // frame draws — with a plain one the figure can show its T-pose for a frame.
  useLayoutEffect(() => {
    actions.standing.play()
    const backToStanding = (e) => {
      if (e.action !== gesture.current) return
      gesture.current = null
      blendTo(actions, actions.standing)
    }
    mixer.addEventListener('finished', backToStanding)
    return () => {
      mixer.removeEventListener('finished', backToStanding)
      mixer.stopAllAction()
    }
  }, [mixer, actions])

  useFrame((_, delta) => mixer.update(delta))

  // The spell is the book opening: each time it goes from closed to open,
  // the staff goes out toward it and the sound plays. Opening again while
  // the staff is still out doesn't restart it, so gesture and sound play
  // whole.
  const wasOpen = useRef(open)
  useEffect(() => {
    const opened = open && !wasOpen.current
    wasOpen.current = open
    if (!opened || gesture.current === actions.staff) return
    gesture.current = actions.staff
    blendTo(actions, actions.staff)
    spell.currentTime = 0
    spell.play()
  }, [open, actions, spell])

  // A click waves, unless a gesture is already going. Click only, no hover:
  // a ray through the skinned figure costs ~7 ms (measured), fine once per
  // click and not on every pointer move.
  return (e) => {
    e.stopPropagation()
    if (gesture.current) return
    gesture.current = actions.wave
    blendTo(actions, actions.wave, WAVE_START)
  }
}
