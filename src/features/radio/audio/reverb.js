// A room to play in, without an impulse-response file: a convolver over
// decaying stereo noise, which is roughly what a hall's echo is once its
// first reflections have blurred together. Each channel gets its own noise,
// so the tail is wide.
//
// `seconds` is how long it takes to fall 60 dB. The tail darkens as it
// goes — stone and air soak up the highs first — by a low-pass that closes
// from `bright` to `dark` (one-pole coefficients). A few milliseconds of
// silence up front keep the reverb from smearing the attack it echoes.
export function createReverb(ctx, { seconds = 3.2, bright = 0.85, dark = 0.12, preDelay = 0.015 } = {}) {
  const rate = ctx.sampleRate
  const length = Math.floor((seconds + preDelay) * rate)
  const start = Math.floor(preDelay * rate)
  const ir = ctx.createBuffer(2, length, rate)
  for (let c = 0; c < 2; c++) {
    const data = ir.getChannelData(c)
    let lp = 0
    for (let i = start; i < length; i++) {
      const t = (i - start) / rate
      const k = bright + (dark - bright) * (t / seconds)
      lp += k * (Math.random() * 2 - 1 - lp)
      data[i] = lp * Math.exp((-6.9 * t) / seconds)
    }
  }
  const convolver = ctx.createConvolver()
  convolver.buffer = ir
  return convolver
}
