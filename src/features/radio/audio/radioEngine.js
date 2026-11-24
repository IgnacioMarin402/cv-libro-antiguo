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
export function createRadioEngine(onStatus) {
  const ctx = getAudioContext()
  const volume = ctx.createGain()
  volume.connect(ctx.destination)

  let current = null

  function play(station) {
    stop()
    const level = ctx.createGain()
    level.gain.value = 0
    level.connect(volume)
    const entry = { level, handle: null }
    current = entry
    entry.handle = startStream(ctx, level, station, (status) => {
      if (current !== entry) return
      if (status === 'live') level.gain.setTargetAtTime(1, ctx.currentTime, FADE_IN / 3)
      // A browser may let the stream play and still hold the page's audio
      // suspended (no gesture yet): it would read as playing, and be mute.
      onStatus(status === 'live' && ctx.state !== 'running' ? 'blocked' : status)
    })
  }

  function stop() {
    if (!current) return
    const { level, handle } = current
    current = null
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
    setVolume(value) {
      volume.gain.setTargetAtTime(volumeGain(value), ctx.currentTime, 0.03)
    },
    dispose() {
      stop()
      setTimeout(() => volume.disconnect(), FADE_OUT * 1000 + 200)
    },
  }
}
