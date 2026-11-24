import { noiseBuffer } from './noise'
import { gainNode } from './scheduler'

// Wind: white noise through a band-pass whose centre, width and level
// wander, each move eased in over most of the gap to the next. The storm
// and the night both blow; how hard is theirs to say (domain/weather).
// Returns its own `schedule(until)`, for the station's scheduler to call.
export function startWind(ctx, out, wind, next, rng) {
  const source = ctx.createBufferSource()
  source.buffer = noiseBuffer(ctx, 'white')
  source.loop = true
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = wind.centre[0]
  band.Q.value = wind.q[0]
  const level = gainNode(ctx, 0, out)
  source.connect(band).connect(level)
  source.start(ctx.currentTime, Math.random() * source.buffer.duration)

  let at = ctx.currentTime
  return {
    schedule(until) {
      while (at < until) {
        const move = next(rng, wind)
        const ease = move.gap / 3
        band.frequency.setTargetAtTime(move.centre, at, ease)
        band.Q.setTargetAtTime(move.q, at, ease)
        level.gain.setTargetAtTime(move.level, at, ease)
        at += move.gap
      }
    },
    stop() {
      source.stop()
    },
  }
}
