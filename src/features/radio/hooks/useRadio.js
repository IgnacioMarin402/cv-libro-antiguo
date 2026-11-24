import { useEffect, useRef, useState } from 'react'
import { wakeAudio } from '@/shared/audio/context'
import { UNMUTED_VOLUME } from '../domain/mix'
import { DEFAULT_STATION, STATIONS, stationIndex, stepStation } from '../domain/stations'
import { createRadioEngine } from '../audio/radioEngine'

// What the visitor set, remembered between visits: the station, and the
// last volume they listened at — for the speaker to bring back. Never the
// sound itself: every visit starts with the radio on and the volume at
// zero (domain/mix).
const STATION_KEY = 'radio-station'
const VOLUME_KEY = 'radio-volume'

function load(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // Storage blocked: it holds for this visit only.
  }
}

function listenedVolume() {
  const v = parseFloat(load(VOLUME_KEY))
  return Number.isFinite(v) && v > 0 ? Math.min(1, v) : UNMUTED_VOLUME
}

// The radio's state, and the gestures that change it. While it's on, its
// station plays — from the moment the room is up (`shown`), at any volume:
// at zero it's only not heard, so the dial can say what's on and turning
// it up is heard at once, mid-song. Folding it away (the lyre) is what
// stops the stream.
//
// Before the visitor has done anything on the page, the browser lets a
// stream play only muted. Their first click or key, anywhere, unlocks it
// (still at zero: nothing is heard that they didn't turn up). Each gesture
// on the radio also tells the engine itself, inside its handler: Safari
// only lets a media element start playing, or be unmuted, from inside the
// handler of what the visitor did, and an effect after the render is
// already outside it.
//
// The wheel isn't such a gesture. Turned up from zero before the visitor
// has clicked anything on the page, the station is 'blocked', until their
// next click or key anywhere.
export function useRadio(shown = true) {
  const [on, setOn] = useState(true)
  const [index, setIndex] = useState(() => {
    const id = load(STATION_KEY)
    return id ? stationIndex(id) : DEFAULT_STATION
  })
  const [volume, setVolumeState] = useState(0)
  const [status, setStatus] = useState('idle')
  const engine = useRef(null)
  const unlocked = useRef(false)
  // The latest of each for the handlers, which a quick double click can
  // run before the render that would hand them the new ones.
  const latest = useRef({ on, index, volume, status })
  latest.current = { on, index, volume, status }

  useEffect(
    () => () => {
      engine.current?.dispose()
      engine.current = null
    },
    []
  )

  const getEngine = () => {
    if (!engine.current) engine.current = createRadioEngine(setStatus, { unlocked: unlocked.current })
    return engine.current
  }

  const start = () => {
    const { index: i, volume: v } = latest.current
    const radio = getEngine()
    radio.setVolume(v)
    radio.play(STATIONS[i])
  }

  const silence = () => {
    engine.current?.stop()
    setStatus('idle')
  }

  // Inside a gesture's handler only. Without one behind it (the wheel,
  // before any click) unmuting would make Chrome pause the stream.
  const unlock = () => {
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return
    wakeAudio()
    unlocked.current = true
    engine.current?.unlock()
  }

  // Tuned in once the room is up, not under the loading screen, where the
  // stream would compete with the scene's own downloads.
  useEffect(() => {
    if (shown && latest.current.on) start()
    // start reads everything it needs from `latest`.
  }, [shown])

  // The first gesture anywhere unlocks the sound (and the engine asks again
  // for a station the browser refused outright).
  useEffect(() => {
    if (unlocked.current && status !== 'blocked') return
    const onGesture = () => unlock()
    const options = { capture: true, once: true }
    window.addEventListener('pointerdown', onGesture, options)
    window.addEventListener('keydown', onGesture, options)
    return () => {
      window.removeEventListener('pointerdown', onGesture, options)
      window.removeEventListener('keydown', onGesture, options)
    }
  }, [status])

  const setVolume = (value) => {
    const { on: isOn } = latest.current
    latest.current.volume = value
    setVolumeState(value)
    if (value > 0) {
      save(VOLUME_KEY, value)
      if (!unlocked.current) unlock()
    }
    if (isOn) engine.current?.setVolume(value)
  }

  // The speaker: to zero, or back to the last volume listened at.
  const toggleSound = () => setVolume(latest.current.volume > 0 ? 0 : listenedVolume())

  const tune = (step) => {
    const { on: isOn, index: i } = latest.current
    const next = stepStation(i, step)
    latest.current.index = next
    setIndex(next)
    save(STATION_KEY, STATIONS[next].id)
    if (isOn) getEngine().play(STATIONS[next])
  }

  // The lyre folds the dial away, and the stream with it; unfolded, it's
  // back as every visit starts: on, playing, at zero.
  const power = () => {
    const wasOn = latest.current.on
    latest.current.on = !wasOn
    setOn(!wasOn)
    if (wasOn) {
      silence()
      latest.current.volume = 0
      setVolumeState(0)
    } else {
      start()
    }
  }

  return {
    on,
    index,
    station: STATIONS[index],
    status,
    volume,
    power,
    tune,
    setVolume,
    toggleSound,
  }
}
