import { getAudioContext } from '@/shared/audio/context'
import { FADE_IN, FADE_OUT, volumeGain } from '../domain/mix'
import { startStream } from './streamStation'

// The radio's sound: one station at a time, each on its own gain, through
// the visitor's volume into the speakers.
//
//   station → its level (fades) → volume → speakers
//
// Changing station fades the old one out and the new one in (domain/mix),
// the new one only once it actually plays, so its first second doesn't
// land at full level. `onStatus` hears the playing station's 'tuning',
// 'live' or 'nosignal'.
//
// The volume at zero is only a gain at zero: the station keeps playing,
// so turning it up is heard at once, mid-song. Until `unlock()` — called
// from inside the visitor's first gesture — stations start muted, which
// is how a browser lets them play at all before one; and turned up before
// then, the station is 'blocked': playing, and not yet allowed to be heard.
export function createRadioEngine(onStatus, { unlocked: startUnlocked = false } = {}) {
  const ctx = getAudioContext()
  const volume = ctx.createGain()
  volume.gain.value = 0
  volume.connect(ctx.destination)

  let current = null
  let unlocked = startUnlocked
  let heard = false
  let streamStatus = 'idle'

  const report = () => {
    const silenced = !unlocked || ctx.state !== 'running'
    onStatus(streamStatus === 'live' && heard && silenced ? 'blocked' : streamStatus)
  }
  // The page's audio waking (the radio's gesture, or the fire's) can make
  // a 'blocked' station heard.
  ctx.addEventListener('statechange', report)

  function play(station) {
    stop()
    const level = ctx.createGain()
    level.gain.value = 0
    level.connect(volume)
    const entry = { level, station, handle: null }
    current = entry
    streamStatus = 'tuning'
    entry.handle = startStream(
      ctx,
      level,
      station,
      (status) => {
        if (current !== entry) return
        if (status === 'live') level.gain.setTargetAtTime(1, ctx.currentTime, FADE_IN / 3)
        streamStatus = status
        report()
      },
      { muted: !unlocked }
    )
  }

  function stop() {
    if (!current) return
    const { level, handle } = current
    current = null
    streamStatus = 'idle'
    level.gain.cancelScheduledValues(ctx.currentTime)
    level.gain.setValueAtTime(level.gain.value, ctx.currentTime)
    level.gain.setTargetAtTime(0, ctx.currentTime, FADE_OUT / 3)
    setTimeout(
      () => {
        handle.stop()
        level.disconnect()
      },
      FADE_OUT * 1000 + 150
    )
  }

  return {
    play,
    stop,
    // From inside a gesture's handler only (see startStream's `muted`).
    // A station the browser refused outright, even muted (a stricter
    // browser), is asked again from inside it.
    unlock() {
      unlocked = true
      if (current && streamStatus === 'blocked') play(current.station)
      else current?.handle.unmute()
      report()
    },
    setVolume(value) {
      heard = value > 0
      volume.gain.setTargetAtTime(volumeGain(value), ctx.currentTime, 0.03)
      report()
    },
    dispose() {
      stop()
      ctx.removeEventListener('statechange', report)
      setTimeout(() => volume.disconnect(), FADE_OUT * 1000 + 200)
    },
  }
}
