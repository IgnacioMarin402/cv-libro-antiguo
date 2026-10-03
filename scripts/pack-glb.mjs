// Compresses a GLB's mesh for the web, in place, and leaves its look alone.
//
//   node scripts/pack-glb.mjs                        every GLB in public/models
//   node scripts/pack-glb.mjs public/models/x.glb    just that one (or several)
//   node scripts/pack-glb.mjs --ktx2 [files]         textures to KTX2 too (see below)
//
// Run it after scripts/shrink-glb.mjs, which brings the maps down to 2048
// first. It needs gltfpack, found in GLTFPACK, then in .tools/ (ignored by
// git), then on the PATH; for --ktx2 it has to be the NATIVE build — the
// npm one has no BasisU: https://github.com/zeux/meshoptimizer/releases
//
// Measured on the scene on 2026-10-02, against renders of the room from
// eight fixed cameras before any of this (PSNR; 69 dB was two renders of
// the same files, so that is "identical"):
//
//   · -cc: the mesh compressed with meshopt. The models' geometry was 42 MB
//     of floats; the fifteen went from 85 MB to 52. The loader needs
//     MeshoptDecoder (see shared/three/useGLTF), which ships with three.
//     Worst camera 45.3 dB, and that one is 45.6 from shrink-glb alone.
//   · -vpf: positions stay floats, in the model's own units. gltfpack's
//     default stores them as integers and moves the scale into a new node,
//     and four features read raw positions in model units: the rug
//     presses itself flat, the door and the window shade their vertices by
//     height, and the wizard builds its belly's morph from them.
//   · -vt 14: texture coordinates to 14 bits rather than the default 12,
//     which over a 2048 map is half a texel.
//   · -kn -km: names kept — the features find meshes and materials by them.
//
// Tried and left out:
//
//   · Simplifying the mesh, even within 0.25 mm: a close-up of the table
//     fell from 46 dB to 34. Merging triangles moves where the texture
//     lands between their corners, and the shading with it. For 37% fewer
//     triangles.
//   · KTX2 textures by default. They stay compressed on the GPU — the
//     models' maps would take 0.3 GB instead of 1.0 — but ETC1S colour put
//     the table's close-up at 31 dB (its cloth is recoloured by hue in a
//     shader, which amplifies any shift), and UASTC normals cost 8 dB there
//     too. All UASTC is better but weighs more than double the JPEG/PNG.
//     --ktx2 is here for when the memory is worth that (ETC1S for colour
//     and roughness/metal at its best quality, UASTC for normal maps).
//   · gzip on top: 2-3%, the textures being most of each file. So
//     server/server.js doesn't bother.
//
// A packed file is skipped. To repack one, restore it from git first.

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

// Left as they are, and why.
const SKIP = {
  // Skinned and animated, which gltfpack would resample; and its gem glow
  // reads the colour map's pixels (see wizard/textures/gemTextures), which
  // a KTX2 texture doesn't have. Its mesh is 1 MB.
  'wizard-cat.glb': 'skinned and animated, and its gem glow reads the colour map as an image',
}

const GEOMETRY = ['-cc', '-vpf', '-vt', '14', '-kn', '-km']
const KTX2 = ['-tc', '-tq', 'color,attrib', '10', '-tu', 'normal']

function findGltfpack() {
  const candidates = [process.env.GLTFPACK, '.tools/gltfpack.exe', '.tools/gltfpack', 'gltfpack'].filter(Boolean)
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ['-v'], { stdio: 'pipe' })
      return candidate
    } catch {
      // Not there; try the next.
    }
  }
  throw new Error('gltfpack not found: set GLTFPACK, or put it in .tools/ (see the top of this file)')
}

function readJson(file) {
  const buf = fs.readFileSync(file)
  return JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString('utf8'))
}

function pack(gltfpack, file, ktx2) {
  const name = path.basename(file)
  if (SKIP[name]) return console.log(`${name}: skipped, ${SKIP[name]}`)
  if ((readJson(file).extensionsUsed ?? []).includes('EXT_meshopt_compression')) return console.log(`${name}: already packed`)

  const out = `${file}.packing.glb`
  execFileSync(gltfpack, ['-i', file, '-o', out, ...GEOMETRY, ...(ktx2 ? KTX2 : [])], { stdio: 'pipe' })
  const before = fs.statSync(file).size
  const after = fs.statSync(out).size
  fs.renameSync(out, file)
  console.log(`${name}: ${(before / 1e6).toFixed(1)} -> ${(after / 1e6).toFixed(1)} MB${ktx2 ? ', KTX2' : ''}`)
}

const args = process.argv.slice(2)
const ktx2 = args.includes('--ktx2')
const paths = args.filter((arg) => arg !== '--ktx2')
const gltfpack = findGltfpack()
const targets = (paths.length ? paths : ['public/models']).flatMap((target) =>
  fs.statSync(target).isDirectory()
    ? fs.readdirSync(target).filter((f) => f.endsWith('.glb')).map((f) => path.join(target, f))
    : [target],
)
for (const file of targets) pack(gltfpack, file, ktx2)
