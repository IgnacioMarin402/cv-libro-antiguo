import { Texture } from 'three'

// A GLTFLoader plugin that decodes every texture of a model no larger than
// `max` px on its longest side, for a device that can't hold them as they
// were made.
//
// Shrunk while decoding, not after: GLTFLoader's own loader hands three a
// full-size bitmap and keeps it, which is the memory this is here to save.
// Decoded one at a time, so twenty models landing together don't stack up
// twenty sets of full-size bitmaps before the first one is shrunk.

let queue = Promise.resolve()
function oneAtATime(task) {
  const run = queue.then(task)
  queue = run.catch(() => {})
  return run
}

// Full size first, as an ImageBitmap where GLTFLoader would use one (with
// its options), so it can be closed the moment it's been drawn smaller. An
// <img> can't be: Chromium keeps its full-size decode cached after it's
// gone. Tried first, emulating an iPhone: the page's memory went on
// climbing past 1.5 GB (1.85 without the cap); with ImageBitmaps it
// settled at 0.93. Where GLTFLoader keeps off ImageBitmaps (Safari before
// 17), an <img> it is.
async function decodeFull(url, bitmaps) {
  if (!bitmaps) {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  }
  const blob = await (await fetch(url)).blob()
  return createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' })
}

// Drawn smaller on a 2D canvas. That changes no colour: the maps here carry
// no colour profile and no transparency (checked: the two RGBA normal maps
// are alpha 255 throughout). The canvas is then traded for an ImageBitmap
// and emptied, because iOS caps the memory all of a page's canvases may
// hold together, and the book's pages already live in canvases.
async function decodeCapped(url, max, bitmaps) {
  const full = await decodeFull(url, bitmaps)
  const width = full.naturalWidth ?? full.width
  const height = full.naturalHeight ?? full.height
  const scale = max / Math.max(width, height)
  if (scale >= 1) return full

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(full, 0, 0, canvas.width, canvas.height)
  full.close?.()
  if (!bitmaps) return canvas

  const bitmap = await createImageBitmap(canvas, { premultiplyAlpha: 'none' })
  canvas.width = canvas.height = 0
  return bitmap
}

export function cappedTexturesPlugin(max) {
  return (parser) => {
    // The loader GLTFLoader chose for this browser says whether it trusts
    // ImageBitmaps here.
    const bitmaps = parser.textureLoader.isImageBitmapLoader === true
    // What GLTFParser.loadTextureImage expects of a loader: load() calling
    // back with a Texture. It sets flipY, filters and wrapping afterwards,
    // as it would for its own.
    const loader = {
      load(url, onLoad, onProgress, onError) {
        oneAtATime(() => decodeCapped(url, max, bitmaps)).then((image) => {
          const texture = new Texture(image)
          texture.needsUpdate = true
          onLoad(texture)
        }, onError)
      },
    }
    return {
      name: 'CAPPED_TEXTURES',
      // Asked after GLTFLoader's own texture plugins (KTX2, WebP, AVIF),
      // which answer first for a texture that uses theirs.
      loadTexture(textureIndex) {
        const source = parser.json.textures[textureIndex].source
        if (source === undefined) return null
        return parser.loadTextureImage(textureIndex, source, loader)
      },
    }
  }
}
