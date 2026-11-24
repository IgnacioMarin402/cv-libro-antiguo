// Keeps a station's events booked ahead of the audio clock: on a timer, it
// asks `schedule(until)` for everything up to `lookahead` seconds from now.
// Web Audio plays what's booked to the sample; the timer only has to stay
// ahead of it — and a hidden tab's timers fire once a second at best, so
// the lookahead is longer than that.
//
// Rendered offline (to measure a station, see mix.js), there is no clock to
// keep up with: the whole render is booked at once.
export function startScheduler(ctx, schedule, { lookahead = 1.6, interval = 0.25 } = {}) {
  if (typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext) {
    schedule(ctx.length / ctx.sampleRate)
    return () => {}
  }
  const tick = () => schedule(ctx.currentTime + lookahead)
  tick()
  const id = setInterval(tick, interval * 1000)
  return () => clearInterval(id)
}

// Disconnects a one-shot voice's nodes once its source has finished, so a
// station that plays for an hour doesn't leave an hour of them hanging off
// its bus.
export function releaseOnEnd(source, ...nodes) {
  source.onended = () => nodes.forEach((node) => node.disconnect())
}

export function gainNode(ctx, value, destination) {
  const node = ctx.createGain()
  node.gain.value = value
  if (destination) node.connect(destination)
  return node
}
