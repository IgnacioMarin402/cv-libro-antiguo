import * as THREE from 'three'

// One AudioContext for the whole page: three's own. Every THREE.AudioListener
// (the fires' positional sound) already plays through it, so anything else
// that makes sound joins it rather than opening a second one — browsers cap
// how many a page may hold, and one context is one clock to schedule against.
export function getAudioContext() {
  return THREE.AudioContext.getContext()
}

// Browsers hold a page's audio suspended until the visitor does something;
// call this from inside the handler of what they did. On an iPhone, Web
// Audio also obeys the ringer's silent switch unless the page says it plays
// media — which Safari's audioSession lets it say, where it has one.
export function wakeAudio() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback'
  } catch {
    // An older Safari with a read-only audioSession: the switch wins there.
  }
  const ctx = getAudioContext()
  return ctx.state === 'running' ? Promise.resolve() : ctx.resume().catch(() => {})
}
