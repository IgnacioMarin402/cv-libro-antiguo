// A plucked string, by Karplus–Strong: a burst of noise as long as one
// period of the note, fed round a loop that averages each sample with the
// next and loses a little every pass. The averaging is a low-pass, so the
// highs die first, the way a real string's do.
//
// It's rendered in JS, a note at a time, not built from Web Audio nodes: a
// DelayNode inside a feedback loop can't be shorter than one render
// quantum (128 samples), which caps such a string at about 340 Hz — under
// half the harp.
//
// Tuned to the cent, not the sample: the loop's length is a whole number
// of samples, and an integer delay alone leaves notes up to 15 cents out
// (measured over the harp's range, D2–D6, at 44.1 and 48 kHz) — audible in
// a chord. A first-order all-pass carries the fraction (Jaffe & Smith,
// 1983): measured by autocorrelation the same way, every note within
// 0.7 cents.
import { midiToFreq, ringTime } from '../domain/harp'

// Pure: samples in, samples out, so it can be measured in Node.
// `brightness` (0–1) is how hard the string is plucked: a one-pole low-pass
// on the noise burst, soft for a finger, hard for a plectrum.
export function renderPluck(sampleRate, freq, { seconds, ring, brightness = 0.5, random = Math.random }) {
  const length = Math.ceil(sampleRate * seconds)
  const out = new Float32Array(length)
  // The averager delays by half a sample; the line and the all-pass carry
  // the rest of the period.
  const period = sampleRate / freq - 0.5
  let size = Math.floor(period)
  let frac = period - size
  // Keep the all-pass's own delay between 0.1 and 1.1 samples, where it's
  // flat across the harmonics that matter.
  if (frac < 0.1) {
    size -= 1
    frac += 1
  }
  const c = (1 - frac) / (1 + frac)
  // Loss per pass, so the note falls 60 dB in `ring` seconds.
  const loss = 0.001 ** (1 / (freq * ring))

  const line = new Float32Array(size)
  let lp = 0
  let mean = 0
  for (let i = 0; i < size; i++) {
    lp += brightness * (random() * 2 - 1 - lp)
    line[i] = lp
    mean += lp
  }
  mean /= size
  for (let i = 0; i < size; i++) line[i] -= mean

  let idx = 0
  let prev = 0
  let apIn = 0
  let apOut = 0
  for (let n = 0; n < length; n++) {
    const cur = line[idx]
    out[n] = cur
    const avg = loss * 0.5 * (cur + prev)
    prev = cur
    const ap = c * avg + apIn - c * apOut
    apIn = avg
    apOut = ap
    line[idx] = ap
    idx = idx + 1 === size ? 0 : idx + 1
  }

  let max = 0
  for (let n = 0; n < length; n++) max = Math.max(max, Math.abs(out[n]))
  if (max > 0) for (let n = 0; n < length; n++) out[n] /= max
  return out
}

// Two takes of every string, cached by sample rate (an AudioBuffer plays in
// any context at its rate): one take each and a run of the same note
// sounds like a machine; a fresh one every time costs a render each.
const VARIANTS = 2
const cache = new Map()

export function pluckBuffer(ctx, midi) {
  const variant = Math.floor(Math.random() * VARIANTS)
  const key = `${ctx.sampleRate}:${midi}:${variant}`
  let buffer = cache.get(key)
  if (!buffer) {
    const freq = midiToFreq(midi)
    const ring = ringTime(freq)
    const samples = renderPluck(ctx.sampleRate, freq, {
      seconds: Math.min(ring, 4.5),
      ring,
      // Low strings are plucked with more flesh, high ones nearer the nail.
      brightness: Math.min(0.75, 0.3 + freq / 2400),
    })
    // The render stops before the string has quite died: a short fade
    // keeps the cut from clicking.
    const fade = Math.floor(0.05 * ctx.sampleRate)
    for (let i = 0; i < fade; i++) samples[samples.length - 1 - i] *= i / fade
    buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate)
    buffer.getChannelData(0).set(samples)
    cache.set(key, buffer)
  }
  return buffer
}
