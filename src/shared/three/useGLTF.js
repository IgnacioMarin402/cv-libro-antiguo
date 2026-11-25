import { useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { cappedTexturesPlugin } from './cappedTextures'

// Where KTX2Loader fetches its transcoder: a copy of three's
// examples/jsm/libs/basis in public/. It has to be the one that came with
// the installed three, so copy it again after upgrading three.
const TRANSCODER_PATH = '/basis/'

// One for the whole scene: it transcodes in workers of its own, and needs
// to have seen the renderer to know which compressed formats the GPU takes.
let ktx2Loader = null

// The longest side, in px, any model's texture may be decoded at; null for
// as they were made. Whoever owns the scene sets it, before the canvas
// mounts: models start loading on its first render, and a model already
// loaded keeps the size it was loaded at.
let maxTextureSize = null
export function setMaxTextureSize(px) {
  maxTextureSize = px
}

// useLoader shares one GLTFLoader among every model and hands it to the
// callback below on each load, so the plugin is registered on the first.
const capped = new WeakSet()

// A glTF model, with the decoders a file from scripts/pack-glb.mjs needs:
// meshopt for its mesh, and KTX2 (Basis) for its textures if it was packed
// with --ktx2 — the transcoder is only fetched when a file has one. A file
// that uses neither loads as it always did. Suspends like useLoader, which
// it wraps, so models are cached by url and shared by every caller.
export function useGLTF(url) {
  const gl = useThree((state) => state.gl)
  return useLoader(GLTFLoader, url, (loader) => {
    ktx2Loader ??= new KTX2Loader().setTranscoderPath(TRANSCODER_PATH).detectSupport(gl)
    loader.setKTX2Loader(ktx2Loader)
    loader.setMeshoptDecoder(MeshoptDecoder)
    if (maxTextureSize && !capped.has(loader)) {
      loader.register(cappedTexturesPlugin(maxTextureSize))
      capped.add(loader)
    }
  })
}
