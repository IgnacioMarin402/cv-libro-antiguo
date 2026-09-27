import { DefaultLoadingManager, FileLoader } from 'three'

// Everything three loads, watched from one place, so a loading screen can
// say how far along the scene is without every loader in it having to
// report in. Two counts, because neither tells it all on its own:
//
// - items, from the LoadingManager every three loader goes through by
//   default. GLTFLoader keeps its item open until the model is parsed, so
//   "every item has ended" means usable, not just downloaded. But an item
//   only counts once it ENDS: eight models downloading side by side read
//   zero until they all land together.
// - bytes, which is what moves during that wait. Only FileLoader streams
//   them (models and audio; images go through an <img> and report
//   nothing), and the only way to hear them without handing a callback to
//   every useLoader in the scene is to wrap its load().
//
// Installed on import: models start loading on the scene's first render,
// so this has to be in place before the canvas mounts.

let started = 0
let ended = 0
// When the loaders last went quiet. Starts at module load, so a scene with
// nothing to load still settles.
let idleSince = performance.now()
// url -> [loaded, total], for every file whose size the server announced.
const bytes = new Map()

const { itemStart, itemEnd } = DefaultLoadingManager
DefaultLoadingManager.itemStart = (url) => {
  started++
  idleSince = null
  itemStart(url)
}
DefaultLoadingManager.itemEnd = (url) => {
  ended++
  if (ended >= started) idleSince = performance.now()
  itemEnd(url)
}

const load = FileLoader.prototype.load
FileLoader.prototype.load = function (url, onLoad, onProgress, onError) {
  const progress = (event) => {
    if (event.lengthComputable) bytes.set(url, [event.loaded, event.total])
    onProgress?.(event)
  }
  // A gzipped response announces its compressed length and streams more
  // than that, so the last progress event isn't always 100%: a file that
  // has arrived is counted whole.
  const done = (data) => {
    const size = bytes.get(url)
    if (size) size[0] = size[1]
    onLoad?.(data)
  }
  return load.call(this, url, done, progress, onError)
}

export function loadState() {
  let loaded = 0
  let total = 0
  for (const [l, t] of bytes.values()) {
    loaded += Math.min(l, t)
    total += t
  }
  return { itemsLoaded: ended, itemsTotal: started, bytesLoaded: loaded, bytesTotal: total, idleSince }
}
