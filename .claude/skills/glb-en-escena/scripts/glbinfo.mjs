// What a GLB holds, read straight off its JSON chunk — nothing is decoded,
// so it works on a 75 MB file from Tripo in a blink and on one already
// packed with meshopt (scripts/pack-glb.mjs) alike.
//
//   node .claude/skills/glb-en-escena/scripts/glbinfo.mjs public/models/x.glb [more.glb ...]
//
// Prints, per file: its size, the generator and extensions, every node with
// its transform, every primitive with its vertex and triangle count and its
// POSITION bounds (in the mesh's own units — Tripo exports stand on y = 0,
// face +z and come about a unit across), every material and every image
// with its pixel size and weight.

import { readFileSync, statSync } from 'node:fs'

const files = process.argv.slice(2)
if (!files.length) {
  console.error('usage: node glbinfo.mjs <file.glb> [...]')
  process.exit(1)
}

// Width and height of a PNG or a JPEG, from its header.
function imageSize(bytes) {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)]
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2
    while (i < bytes.length) {
      const marker = bytes[i + 1]
      const length = bytes.readUInt16BE(i + 2)
      if (marker >= 0xc0 && marker <= 0xc3) return [bytes.readUInt16BE(i + 7), bytes.readUInt16BE(i + 5)]
      i += 2 + length
    }
  }
  return null
}

const mb = (n) => `${(n / 1e6).toFixed(1)} MB`
const round = (list) => list?.map((v) => +v.toFixed(4))

for (const file of files) {
  const buf = readFileSync(file)
  const jsonLength = buf.readUInt32LE(12)
  const json = JSON.parse(buf.subarray(20, 20 + jsonLength).toString('utf8'))
  const binStart = 20 + jsonLength + 8
  const { accessors, bufferViews } = json

  console.log(`\n${file} — ${mb(statSync(file).size)}`)
  console.log(`  generator: ${json.asset?.generator} · extensions: ${(json.extensionsUsed ?? []).join(', ') || 'none'}`)
  console.log(
    `  nodes ${json.nodes?.length ?? 0} · meshes ${json.meshes?.length ?? 0} · materials ${json.materials?.length ?? 0}` +
      ` · images ${json.images?.length ?? 0} · animations ${json.animations?.length ?? 0} · skins ${json.skins?.length ?? 0}`
  )

  json.nodes?.forEach((n, i) => {
    const transform = [n.translation && `t ${round(n.translation)}`, n.rotation && `r ${round(n.rotation)}`, n.scale && `s ${round(n.scale)}`]
      .filter(Boolean)
      .join(' ')
    console.log(`  node ${i} ${n.name ?? ''} mesh ${n.mesh ?? '-'} ${transform}`)
  })

  let triangles = 0
  json.meshes?.forEach((mesh, i) =>
    mesh.primitives.forEach((p, j) => {
      const position = accessors[p.attributes.POSITION]
      const tris = (p.indices !== undefined ? accessors[p.indices].count : position.count) / 3
      triangles += tris
      console.log(
        `  mesh ${i} prim ${j}: ${position.count} verts, ${tris} tris, min ${round(position.min)} max ${round(position.max)}` +
          `, material ${p.material}, ${Object.keys(p.attributes).join(',')}`
      )
    })
  )
  console.log(`  triangles in all: ${triangles}`)

  json.materials?.forEach((m, i) => {
    const pbr = m.pbrMetallicRoughness ?? {}
    const maps = [
      pbr.baseColorTexture && 'color',
      pbr.metallicRoughnessTexture && 'metal/rough',
      m.normalTexture && 'normal',
      m.emissiveTexture && 'emissive',
      m.occlusionTexture && 'occlusion',
    ].filter(Boolean)
    console.log(`  material ${i}: maps ${maps.join(', ') || 'none'} · doubleSided ${!!m.doubleSided} · alpha ${m.alphaMode ?? 'OPAQUE'}`)
  })

  json.images?.forEach((image, i) => {
    const view = bufferViews[image.bufferView]
    const bytes = buf.subarray(binStart + (view.byteOffset ?? 0), binStart + (view.byteOffset ?? 0) + view.byteLength)
    const size = imageSize(bytes)
    console.log(`  image ${i}: ${image.mimeType} ${size ? size.join('x') : '?'} · ${mb(view.byteLength)}`)
  })
}
