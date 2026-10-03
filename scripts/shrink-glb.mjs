// Lightens the textures baked into a GLB, in place, and nothing else.
//
//   node scripts/shrink-glb.mjs                        every GLB in public/models
//   node scripts/shrink-glb.mjs public/models/x.glb    just that one (or several)
//
// The models come from generators that bake every map at 4096 px, with the
// metallic-roughness map as a PNG. The first pass over the scene's eight took
// them from 133 MB to 45 MB, and the GPU's share from about 1.8 GB to 0.5:
//
//   · every texture above MAX is downscaled to MAX. A 4096 map is 89 MB of
//     video memory once mipmapped; 2048, 22 MB.
//   · metallic-roughness maps become JPEG. They were the heaviest files (the
//     table's alone was 17.8 MB) and the least visible, being only light
//     response. Chroma 4:4:4, because G (roughness) and B (metalness) are
//     separate data, and the default 4:2:0 would blur each into the other.
//     Measured against a plain downscale: 1.3/255 mean error at worst. The
//     alpha JPEG drops was 255 everywhere in all of them.
//   · normal maps stay PNG: JPEG's blocks show up in the lighting.
//
// Only the images are rewritten. Every other byte of the binary chunk —
// meshes, skins, animations — is copied as is, and checked after writing,
// so a model that comes out of here differs from its input only in its
// pictures. A model with nothing left to shrink is left untouched, so
// running it twice is harmless. It writes over the input: git is the backup.

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const MAX = 2048
const JPEG_QUALITY = 90
const GLB_MAGIC = 0x46546c67
const JSON_CHUNK = 0x4e4f534a
const BIN_CHUNK = 0x004e4942

function readGlb(buf) {
  if (buf.readUInt32LE(0) !== GLB_MAGIC) throw new Error('not a GLB')
  const jsonLength = buf.readUInt32LE(12)
  const json = JSON.parse(buf.subarray(20, 20 + jsonLength).toString('utf8'))
  const binStart = 20 + jsonLength
  const bin = buf.subarray(binStart + 8, binStart + 8 + buf.readUInt32LE(binStart))
  return { json, bin }
}

function chunk(type, data, padByte) {
  const padded = Buffer.concat([data, Buffer.alloc((4 - (data.length % 4)) % 4, padByte)])
  const header = Buffer.alloc(8)
  header.writeUInt32LE(padded.length, 0)
  header.writeUInt32LE(type, 4)
  return Buffer.concat([header, padded])
}

function writeGlb(json, bin) {
  const body = Buffer.concat([chunk(JSON_CHUNK, Buffer.from(JSON.stringify(json), 'utf8'), 0x20), chunk(BIN_CHUNK, bin, 0)])
  const header = Buffer.alloc(12)
  header.writeUInt32LE(GLB_MAGIC, 0)
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(12 + body.length, 8)
  return Buffer.concat([header, body])
}

const viewBytes = (bin, view) => bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength)

// Which material slots each image fills: what it IS decides what it can
// become.
function imageSlots(json) {
  const slots = {}
  const add = (ref, slot) => {
    if (!ref) return
    const source = json.textures[ref.index].source
    ;(slots[source] ??= new Set()).add(slot)
  }
  for (const m of json.materials ?? []) {
    const pbr = m.pbrMetallicRoughness ?? {}
    add(pbr.baseColorTexture, 'base')
    add(pbr.metallicRoughnessTexture, 'mr')
    add(m.normalTexture, 'normal')
    add(m.occlusionTexture, 'occlusion')
    add(m.emissiveTexture, 'emissive')
    for (const ext of Object.values(m.extensions ?? {})) {
      for (const [key, value] of Object.entries(ext)) if (value?.index !== undefined) add(value, `ext:${key}`)
    }
  }
  return slots
}

async function shrinkImage(bytes, mimeType, slots) {
  const { width, height } = await sharp(bytes).metadata()
  // Only a map that is nothing but metallic-roughness: an image shared with
  // the base colour or the emission is colour, and keeps its format.
  const isMR = slots.has('mr') && !slots.has('base') && !slots.has('emissive')
  const tooBig = width > MAX || height > MAX
  const toJpeg = isMR && mimeType === 'image/png'
  if (!tooBig && !toJpeg) return null

  let image = sharp(bytes)
  if (tooBig) image = image.resize(MAX, MAX, { fit: 'inside' })
  if (isMR || mimeType === 'image/jpeg') {
    // A normal map already shipped as JPEG keeps full chroma too.
    const fullChroma = isMR || slots.has('normal')
    image = image.jpeg({ quality: JPEG_QUALITY, chromaSubsampling: fullChroma ? '4:4:4' : '4:2:0', mozjpeg: true })
    mimeType = 'image/jpeg'
  } else {
    image = image.png({ compressionLevel: 9, adaptiveFiltering: true })
  }
  const note = `${width}x${height}${tooBig ? ` -> ${MAX}` : ''}${toJpeg ? ', png -> jpeg' : ''}`
  return { bytes: await image.toBuffer(), mimeType, note }
}

// Every view that isn't an image must be byte-identical to the original,
// and every image must decode as what the JSON says it is.
async function check(file, original, written) {
  const a = readGlb(original)
  const b = readGlb(written)
  const images = new Map((b.json.images ?? []).map((im) => [im.bufferView, im.mimeType]))
  for (const [i, view] of b.json.bufferViews.entries()) {
    const bytes = viewBytes(b.bin, view)
    if (images.has(i)) {
      const { format } = await sharp(bytes).metadata()
      if (`image/${format}` !== images.get(i)) throw new Error(`${file}: view ${i} is ${format}, labelled ${images.get(i)}`)
    } else if (!bytes.equals(viewBytes(a.bin, a.json.bufferViews[i]))) {
      throw new Error(`${file}: view ${i} changed`)
    }
  }
}

async function shrinkGlb(file) {
  const original = fs.readFileSync(file)
  const { json, bin } = readGlb(original)
  // Packed by scripts/pack-glb.mjs, which runs after this: its meshopt data
  // sits in a second buffer this doesn't lay out, and with --ktx2 its maps
  // are KTX2, which sharp can't read.
  if ((json.extensionsUsed ?? []).includes('EXT_meshopt_compression')) {
    console.log(`${path.basename(file)}: packed, nothing to shrink`)
    return
  }
  if (json.bufferViews.some((view) => (view.buffer ?? 0) !== 0)) throw new Error(`${file}: more than one buffer`)
  const slots = imageSlots(json)
  const replaced = new Map()
  const notes = []
  for (const [i, image] of (json.images ?? []).entries()) {
    if (image.bufferView === undefined) continue
    const bytes = viewBytes(bin, json.bufferViews[image.bufferView])
    const imageSlotsOf = slots[i] ?? new Set()
    const result = await shrinkImage(bytes, image.mimeType, imageSlotsOf)
    const role = [...imageSlotsOf].join('+') || 'unused'
    if (!result) {
      notes.push(`  ${role}: kept`)
      continue
    }
    image.mimeType = result.mimeType
    replaced.set(image.bufferView, result.bytes)
    notes.push(`  ${role}: ${result.note}, ${(bytes.length / 1e6).toFixed(1)} -> ${(result.bytes.length / 1e6).toFixed(1)} MB`)
  }
  const name = path.basename(file)
  if (replaced.size === 0) {
    console.log(`${name}: nothing to shrink`)
    return
  }

  // Lay the binary chunk out again view by view, on 4-byte boundaries (the
  // widest component type an accessor can read).
  const parts = []
  let cursor = 0
  for (const [i, view] of json.bufferViews.entries()) {
    const bytes = replaced.get(i) ?? viewBytes(bin, view)
    const pad = (4 - (cursor % 4)) % 4
    parts.push(Buffer.alloc(pad), bytes)
    cursor += pad
    view.byteOffset = cursor
    view.byteLength = bytes.length
    cursor += bytes.length
  }
  const newBin = Buffer.concat(parts)
  json.buffers[0].byteLength = newBin.length
  const written = writeGlb(json, newBin)
  await check(name, original, written)
  fs.writeFileSync(file, written)
  console.log(`${name}: ${(original.length / 1e6).toFixed(1)} -> ${(written.length / 1e6).toFixed(1)} MB`)
  notes.forEach((note) => console.log(note))
}

const args = process.argv.slice(2)
const targets = (args.length ? args : ['public/models']).flatMap((target) =>
  fs.statSync(target).isDirectory()
    ? fs.readdirSync(target).filter((f) => f.endsWith('.glb')).map((f) => path.join(target, f))
    : [target],
)
for (const file of targets) await shrinkGlb(file)
