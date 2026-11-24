import { BPM, BELL_PARTIALS, DRONE, createHarpComposer, midiToFreq } from '../domain/harp'
import { pluckBuffer } from './pluck'
import { createReverb } from './reverb'
import { gainNode, releaseOnEnd, startScheduler } from './scheduler'

// Levels inside the station, before its place in the mix (mix.js). The
// harp is mostly dry, the bells mostly hall; the drone is felt more than
// heard.
const HARP = 0.55
const BELL = 0.16
const DRONE_LEVEL = 0.045
const DRY = 0.75
const WET = 0.55

// The wizard's harp (domain/harp), played: plucked strings through a
// soundboard and a hall, over a drone, with a bell now and then.
export function startHarp(ctx, out) {
  const reverb = createReverb(ctx, { seconds: 3.4 })
  reverb.connect(gainNode(ctx, WET, out))
  const dry = gainNode(ctx, DRY, out)

  // The soundboard: a broad lift where a harp's body resonates, and the
  // very top shaved off, which the string's own loop leaves a little fizzy.
  const body = ctx.createBiquadFilter()
  body.type = 'peaking'
  body.frequency.value = 230
  body.Q.value = 0.8
  body.gain.value = 3
  const top = ctx.createBiquadFilter()
  top.type = 'highshelf'
  top.frequency.value = 5000
  top.gain.value = -4
  body.connect(top)
  top.connect(dry)
  top.connect(reverb)

  // The drone: two triangles a few cents apart per note, so they beat
  // slowly against each other, through a low-pass that breathes.
  const droneOut = gainNode(ctx, DRONE_LEVEL)
  const droneFilter = ctx.createBiquadFilter()
  droneFilter.type = 'lowpass'
  droneFilter.frequency.value = 420
  droneFilter.Q.value = 0.5
  droneFilter.connect(droneOut)
  droneOut.connect(dry)
  droneOut.connect(reverb)
  const oscillators = []
  for (const midi of DRONE) {
    for (const cents of [-4, 4]) {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = midiToFreq(midi)
      osc.detune.value = cents
      osc.connect(droneFilter)
      oscillators.push(osc)
    }
  }
  const breath = ctx.createOscillator()
  breath.frequency.value = 0.06
  const breathDepth = gainNode(ctx, 140, droneFilter.frequency)
  breath.connect(breathDepth)
  oscillators.push(breath)
  const now = ctx.currentTime
  droneOut.gain.setValueAtTime(0, now)
  droneOut.gain.linearRampToValueAtTime(DRONE_LEVEL, now + 4)
  oscillators.forEach((osc) => osc.start(now))

  function pluck(note, time) {
    const source = ctx.createBufferSource()
    source.buffer = pluckBuffer(ctx, note.midi)
    // Softer notes are duller as well as quieter, as on the real thing.
    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 1800 + note.velocity * 7000
    const level = gainNode(ctx, note.velocity * HARP)
    const pan = ctx.createStereoPanner()
    pan.pan.value = note.pan
    source.connect(tone).connect(level).connect(pan).connect(body)
    source.start(time)
    releaseOnEnd(source, tone, level, pan)
  }

  function bell(note, time) {
    const pan = ctx.createStereoPanner()
    pan.pan.value = note.pan
    pan.connect(dry)
    pan.connect(reverb)
    // Mostly hall: the dry side is a third of it.
    const send = gainNode(ctx, note.velocity * BELL, pan)
    const freq = midiToFreq(note.midi)
    let longest = null
    for (const { ratio, level, ring } of BELL_PARTIALS) {
      const osc = ctx.createOscillator()
      osc.frequency.value = freq * ratio
      const env = ctx.createGain()
      env.gain.setValueAtTime(0, time)
      env.gain.linearRampToValueAtTime(level, time + 0.004)
      env.gain.setTargetAtTime(0, time + 0.004, ring / 6.9)
      osc.connect(env).connect(send)
      osc.start(time)
      osc.stop(time + ring + 0.5)
      releaseOnEnd(osc, env)
      longest = osc
    }
    longest.addEventListener('ended', () => {
      send.disconnect()
      pan.disconnect()
    })
  }

  const composer = createHarpComposer()
  const beat = 60 / BPM
  let barStart = ctx.currentTime + 0.2
  const stopScheduler = startScheduler(ctx, (until) => {
    while (barStart < until) {
      const bar = composer.nextBar()
      for (const note of bar.notes) {
        const time = barStart + note.beat * beat
        if (note.voice === 'bell') bell(note, time)
        else pluck(note, time)
      }
      barStart += bar.beats * beat
    }
  })

  return {
    stop() {
      stopScheduler()
      oscillators.forEach((osc) => osc.stop())
    },
  }
}
