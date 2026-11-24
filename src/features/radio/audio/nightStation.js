import {
  CRICKETS,
  WIND,
  createCricket,
  nextChirp,
  nextOwl,
  nextWind,
  owlCall,
} from '../domain/weather'
import { createReverb } from './reverb'
import { gainNode, releaseOnEnd, startScheduler } from './scheduler'
import { startWind } from './wind'

// A still night outside (domain/weather): crickets in the grass, a breath
// of wind, and far off an owl.
export function startNight(ctx, out) {
  const rng = Math.random
  const oscillators = []
  const reverb = createReverb(ctx, { seconds: 2.4, bright: 0.6 })
  reverb.connect(gainNode(ctx, 0.9, out))

  // Each cricket is a sine left running, gated by its chirps: one
  // oscillator for the night rather than one per pulse.
  const crickets = Array.from({ length: CRICKETS.count }, () => {
    const cricket = createCricket(rng)
    const osc = ctx.createOscillator()
    osc.frequency.value = cricket.carrier
    const gate = gainNode(ctx, 0)
    const pan = ctx.createStereoPanner()
    pan.pan.value = cricket.pan
    const level = gainNode(ctx, cricket.level)
    osc.connect(gate).connect(level).connect(pan)
    pan.connect(out)
    pan.connect(gainNode(ctx, 0.3, reverb))
    osc.start()
    oscillators.push(osc)
    // They don't start in step.
    return { cricket, gate, at: ctx.currentTime + 0.2 + rng() * cricket.every }
  })

  function chirp(gate, pulses, time) {
    const { pulseLength, pulseGap } = CRICKETS
    for (let p = 0; p < pulses; p++) {
      const t = time + p * (pulseLength + pulseGap)
      gate.gain.setValueAtTime(0, t)
      gate.gain.linearRampToValueAtTime(1, t + 0.003)
      gate.gain.setValueAtTime(1, t + pulseLength - 0.004)
      gate.gain.linearRampToValueAtTime(0, t + pulseLength)
    }
  }

  function owl(call, time) {
    const pan = ctx.createStereoPanner()
    pan.pan.value = call.pan
    // Far off: a little of it straight, most of it from the hall.
    const direct = gainNode(ctx, 0.35, out)
    pan.connect(direct)
    pan.connect(reverb)
    const low = ctx.createBiquadFilter()
    low.type = 'lowpass'
    low.frequency.value = 900
    low.connect(pan)
    let last = null
    for (const h of call.hoots) {
      const t = time + h.at
      const osc = ctx.createOscillator()
      osc.frequency.setValueAtTime(h.from, t)
      osc.frequency.linearRampToValueAtTime(h.peak, t + h.duration * 0.3)
      osc.frequency.linearRampToValueAtTime(h.to, t + h.duration)
      // A hollow tone, like breath over a bottle: the fundamental and a
      // trace of its octave.
      const octave = ctx.createOscillator()
      octave.frequency.setValueAtTime(h.from * 2, t)
      octave.frequency.linearRampToValueAtTime(h.peak * 2, t + h.duration * 0.3)
      octave.frequency.linearRampToValueAtTime(h.to * 2, t + h.duration)
      const octaveLevel = gainNode(ctx, 0.12)
      const env = ctx.createGain()
      env.gain.setValueAtTime(0, t)
      env.gain.linearRampToValueAtTime(h.level, t + Math.min(0.06, h.duration * 0.3))
      env.gain.setTargetAtTime(0, t + h.duration * 0.55, h.duration * 0.15)
      osc.connect(env)
      octave.connect(octaveLevel).connect(env)
      env.connect(low)
      const end = t + h.duration + 0.4
      osc.start(t)
      octave.start(t)
      osc.stop(end)
      octave.stop(end)
      releaseOnEnd(osc, env)
      releaseOnEnd(octave, octaveLevel)
      last = osc
    }
    last.addEventListener('ended', () => {
      low.disconnect()
      pan.disconnect()
      direct.disconnect()
    })
  }

  const wind = startWind(ctx, out, WIND.night, nextWind, rng)

  let nextOwlAt = ctx.currentTime + nextOwl(rng, true)
  const stopScheduler = startScheduler(ctx, (until) => {
    for (const c of crickets) {
      while (c.at < until) {
        const next = nextChirp(rng, c.cricket)
        chirp(c.gate, next.pulses, c.at)
        c.at += next.gap
      }
    }
    while (nextOwlAt < until) {
      owl(owlCall(rng), nextOwlAt)
      nextOwlAt += nextOwl(rng)
    }
    wind.schedule(until)
  })

  return {
    stop() {
      stopScheduler()
      wind.stop()
      oscillators.forEach((osc) => osc.stop())
    },
  }
}
