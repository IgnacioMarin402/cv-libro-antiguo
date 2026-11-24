import { useEffect, useRef, useState } from 'react'
import { wakeAudio } from '@/shared/audio/context'
import { DEFAULT_VOLUME } from '../domain/mix'
import { DEFAULT_STATION, STATIONS, stationIndex, stepStation } from '../domain/stations'
import { createRadioEngine } from '../audio/radioEngine'

// What the visitor has set the radio to, remembered between visits: the
// station and the volume, never whether it's on. It always starts off —
// this is a CV, and a recruiter's office with the speakers up is the last
// place to start talking unasked.
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

function storedVolume() {
  const v = parseFloat(load(VOLUME_KEY))
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : DEFAULT_VOLUME
}

// The radio's state, and the gestures that change it. Each gesture tells
// the engine itself, inside the click: Safari only lets a media element
// start playing from inside the handler of what the visitor did, and an
// effect after the render is already outside it.
export function useRadio() {
  const [on, setOn] = useState(false)
  const [index, setIndex] = useState(() => {
    const id = load(STATION_KEY)
    return id ? stationIndex(id) : DEFAULT_STATION
  })
  const [volume, setVolumeState] = useState(storedVolume)
  const [status, setStatus] = useState('off')
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

  const power = () => {
    const { on: isOn, index: i, volume: v } = latest.current
    if (isOn) {
      engine.current?.stop()
      latest.current.on = false
      setOn(false)
      setStatus('off')
      return
    }
    wakeAudio()
    const radio = getEngine()
    radio.setVolume(v)
    radio.play(STATIONS[i])
    latest.current.on = true
    setOn(true)
  }

  const tune = (step) => {
    const { on: isOn, index: i } = latest.current
    const next = stepStation(i, step)
    latest.current.index = next
    setIndex(next)
    save(STATION_KEY, STATIONS[next].id)
    if (isOn) getEngine().play(STATIONS[next])
  }

  const setVolume = (value) => {
    latest.current.volume = value
    setVolumeState(value)
    save(VOLUME_KEY, value)
    engine.current?.setVolume(value)
  }

  return { on, index, station: STATIONS[index], status, volume, power, tune, setVolume }
}
