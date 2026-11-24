import {
  RAIN,
  WIND,
  nextDrop,
  nextGust,
  nextThunder,
  nextWind,
  thunderStrike,
} from '../domain/weather'
import { noiseBuffer, tickBuffer } from './noise'
import { createReverb } from './reverb'
import { gainNode, releaseOnEnd, startScheduler } from './scheduler'
import { startWind } from './wind'

// A storm outside the window (domain/weather): rain hissing on the glass
// and roaring on the roof, drops striking near, wind, and thunder rolling
// in now and then.
export function startStorm(ctx, out) {
  const rng = Math.random
  const sources = []
  const reverb = createReverb(ctx, { seconds: 2.6, bright: 0.5 })
  reverb.connect(gainNode(ctx, 0.5, out))

  // Everything rain goes through the gust: one gain the storm leans on.
  const gust = gainNode(ctx, 0.85, out)
  const loop = (buffer, ...chain) => {
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    // Each layer starts somewhere else in its loop, so they never line up.
    source.start(ctx.currentTime, Math.random() * buffer.duration)
    chain.reduce((node, next) => node.connect(next), source)
    sources.push(source)
  }

  // The hiss: pink noise with its rumble and its very top cut away.
  const hissHigh = ctx.createBiquadFilter()
  hissHigh.type = 'highpass'
  hissHigh.frequency.value = 500
  const hissLow = ctx.createBiquadFilter()
  hissLow.type = 'lowpass'
  hissLow.frequency.value = 7500
  loop(noiseBuffer(ctx, 'pink'), hissHigh, hissLow, gainNode(ctx, RAIN.hiss), gust)

  // The roar on the roof, further off: brown noise, low and dull.
  const roar = ctx.createBiquadFilter()
  roar.type = 'lowpass'
  roar.frequency.value = 900
  loop(noiseBuffer(ctx, 'brown'), roar, gainNode(ctx, RAIN.roar), gust)

  const tick = tickBuffer(ctx)
  function drop(d, time) {
    const source = ctx.createBufferSource()
    source.buffer = tick
    const ping = ctx.createBiquadFilter()
    ping.type = 'bandpass'
    ping.frequency.value = d.freq
    ping.Q.value = 7
    const level = gainNode(ctx, d.level)
    const pan = ctx.createStereoPanner()
    pan.pan.value = d.pan
    source.connect(ping).connect(level).connect(pan).connect(gust)
    source.start(time)
    releaseOnEnd(source, ping, level, pan)
  }

  const brown = noiseBuffer(ctx, 'brown')
  const white = noiseBuffer(ctx, 'white')
  function thunder(strike, time) {
    const pan = ctx.createStereoPanner()
    pan.pan.value = strike.pan
    pan.connect(out)
    pan.connect(reverb)

    const rumble = ctx.createBufferSource()
    rumble.buffer = brown
    rumble.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(strike.cutoff[0], time)
    filter.frequency.exponentialRampToValueAtTime(strike.cutoff[1], time + strike.duration)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, time)
    for (const s of strike.swells) {
      env.gain.setTargetAtTime(s.level, time + s.at, s.attack / 3)
      env.gain.setTargetAtTime(s.level * 0.2, time + s.at + s.attack, s.decay / 3)
    }
    env.gain.setTargetAtTime(0, time + strike.duration - 1.2, 0.4)
    rumble.connect(filter).connect(env).connect(pan)
    rumble.start(time, Math.random() * brown.duration)
    rumble.stop(time + strike.duration + 0.5)

    let crack = null
    if (strike.crack) {
      // Overhead, the air splits first: a burst of the whole band.
      crack = ctx.createBufferSource()
      crack.buffer = white
      const high = ctx.createBiquadFilter()
      high.type = 'highpass'
      high.frequency.value = 700
      const crackEnv = ctx.createGain()
      crackEnv.gain.setValueAtTime(0, time)
      crackEnv.gain.linearRampToValueAtTime(strike.crack, time + 0.006)
      crackEnv.gain.setTargetAtTime(0, time + 0.006, 0.09)
      crack.connect(high).connect(crackEnv).connect(pan)
      crack.start(time, Math.random() * white.duration)
      crack.stop(time + 0.8)
      releaseOnEnd(crack, high, crackEnv)
    }
    rumble.onended = () => [filter, env, pan].forEach((node) => node.disconnect())
  }

  const wind = startWind(ctx, out, WIND.storm, nextWind, rng)

  const start = ctx.currentTime + 0.1
  let nextDropAt = start
  let nextGustAt = start
  let nextThunderAt = start + nextThunder(rng, true)
  const stopScheduler = startScheduler(ctx, (until) => {
    while (nextDropAt < until) {
      const d = nextDrop(rng)
      drop(d, nextDropAt)
      nextDropAt += d.gap
    }
    while (nextGustAt < until) {
      const g = nextGust(rng)
      gust.gain.setTargetAtTime(g.level, nextGustAt, g.gap / 3)
      nextGustAt += g.gap
    }
    while (nextThunderAt < until) {
      const strike = thunderStrike(rng)
      thunder(strike, nextThunderAt)
      nextThunderAt += strike.duration + nextThunder(rng)
    }
    wind.schedule(until)
  })

  return {
    stop() {
      stopScheduler()
      wind.stop()
      sources.forEach((source) => source.stop())
    },
  }
}
