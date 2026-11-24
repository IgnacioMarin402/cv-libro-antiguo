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

// The radio's state, and the gestures that change it. A stream plays only
// while the radio is on and its volume above zero; at zero it isn't even
// fetched. Each gesture tells the engine itself, inside its handler:
// Safari only lets a media element start playing from inside the handler
// of what the visitor did, and an effect after the render is already
// outside it.
//
// The wheel isn't such a gesture. Turned up from zero before the visitor
// has clicked anything on the page, the browser refuses the stream:
// 'blocked', until their next click or key anywhere, which starts it.
export function useRadio() {
  const [on, setOn] = useState(true)
  const [index, setIndex] = useState(() => {
    const id = load(STATION_KEY)
    return id ? stationIndex(id) : DEFAULT_STATION
  })
  const [volume, setVolumeState] = useState(0)
  const [status, setStatus] = useState('idle')
  const engine = useRef(null)
  // The latest of each for the handlers, which a quick double click can
  // run before the render that would hand them the new ones.
  const latest = useRef({ on, index, volume })
  latest.current = { on, index, volume }

  useEffect(
    () => () => {
      engine.current?.dispose()
      engine.current = null
    },
    []
  )

  const getEngine = () => {
    if (!engine.current) engine.current = createRadioEngine(setStatus)
    return engine.current
  }

  const start = () => {
    const { index: i, volume: v } = latest.current
    wakeAudio()
    const radio = getEngine()
    radio.setVolume(v)
    radio.play(STATIONS[i])
  }

  const silence = () => {
    engine.current?.stop()
    setStatus('idle')
  }

  useEffect(() => {
    if (status !== 'blocked') return
    const retry = () => {
      if (latest.current.on && latest.current.volume > 0) start()
    }
    const options = { capture: true, once: true }
    window.addEventListener('pointerdown', retry, options)
    window.addEventListener('keydown', retry, options)
    return () => {
      window.removeEventListener('pointerdown', retry, options)
      window.removeEventListener('keydown', retry, options)
    }
    // start reads everything it needs from `latest`: status is the only dep.
  }, [status])

  const setVolume = (value) => {
    const { on: isOn, volume: was } = latest.current
    latest.current.volume = value
    setVolumeState(value)
    if (value > 0) save(VOLUME_KEY, value)
    if (!isOn) return
    if (value > 0 && was === 0) start()
    else if (value === 0 && was > 0) silence()
    else engine.current?.setVolume(value)
  }

  // The speaker: to zero, or back to the last volume listened at.
  const toggleSound = () => setVolume(latest.current.volume > 0 ? 0 : listenedVolume())

  const tune = (step) => {
    const { on: isOn, index: i, volume: v } = latest.current
    const next = stepStation(i, step)
    latest.current.index = next
    setIndex(next)
    save(STATION_KEY, STATIONS[next].id)
    if (isOn && v > 0) getEngine().play(STATIONS[next])
  }

  // The lyre folds the dial away, and the sound with it; unfolded, it's
  // back as every visit starts: on, at zero.
  const power = () => {
    if (latest.current.on) {
      silence()
      latest.current.volume = 0
      setVolumeState(0)
    }
    latest.current.on = !latest.current.on
    setOn(latest.current.on)
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
