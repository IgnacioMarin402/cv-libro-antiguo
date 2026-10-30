import * as THREE from 'three'
import { HEAD_PIVOT, HEAD_LINE_NORMAL, HEAD_SHARE_FROM, HEAD_SHARE_TO } from '../domain/head'
import {
  EYES,
  EYE_DEPTH,
  LID_COLOR,
  LID_ROUGHNESS,
  LID_REACH,
  RIM_SOFTNESS,
  DRY_REACH,
  FUR_STRANDS,
  LASH_WIDTH,
} from '../domain/eyes'
import { JAW_HINGE, JAW_ANGLE, JAW_SHARE, MOUTH_STRETCH, MOUTH_COLOR, MOUTH_ROUGHNESS } from '../domain/jaw'

const glslFloat = (x) => (Number.isInteger(x) ? `${x}.0` : `${x}`)
const glslVec3 = (v) => `vec3(${v.map(glslFloat).join(', ')})`

// Each eye's own axes on the surface: across it, level, and up it, square
// to the way it faces.
const eyeAxes = ({ normal }) => {
  const n = new THREE.Vector3(...normal).normalize()
  const across = new THREE.Vector3(0, 1, 0).cross(n).normalize()
  const up = n.clone().cross(across)
  return { n: n.toArray(), across: across.toArray(), up: up.toArray() }
}

const lid = new THREE.Color(LID_COLOR) // three decodes the hex from sRGB to linear
const mouth = new THREE.Color(MOUTH_COLOR)

// The jaw's drop, in the bind pose, before the head turns it: each vertex
// takes its share of uJaw (0..1, how open the mouth is) of the full drop,
// a turn about the hinge across the muzzle (see domain/jaw). Its share is
// read off the bind pose's normal and position, so it's the same shape at
// every frame.
const JAW = /* glsl */ `
uniform float uJaw;

float bustJawShare(vec3 p, vec3 n) {
  float s = smoothstep(${glslFloat(JAW_SHARE.facing[0])}, ${glslFloat(JAW_SHARE.facing[1])}, n.y);
  s *= 1.0 - smoothstep(${glslFloat(JAW_SHARE.across[0])}, ${glslFloat(JAW_SHARE.across[1])}, abs(p.x - ${glslFloat(JAW_SHARE.middleX)}));
  s *= smoothstep(${glslFloat(JAW_SHARE.back[0])}, ${glslFloat(JAW_SHARE.back[1])}, p.z);
  s *= 1.0 - smoothstep(${glslFloat(JAW_SHARE.front[0])}, ${glslFloat(JAW_SHARE.front[1])}, p.z);
  s *= smoothstep(${glslFloat(JAW_SHARE.below[0])}, ${glslFloat(JAW_SHARE.below[1])}, p.y);
  s *= 1.0 - smoothstep(${glslFloat(JAW_SHARE.above[0])}, ${glslFloat(JAW_SHARE.above[1])}, p.y);
  return s;
}

// Turned about x by the vertex's share of the drop: its front goes down.
vec3 bustJawTurn(vec3 v, float share) {
  float a = ${glslFloat(JAW_ANGLE)} * uJaw * share;
  float c = cos(a);
  float s = sin(a);
  return vec3(v.x, v.y * c - v.z * s, v.y * s + v.z * c);
}
`
const JAW_HINGE_POINT = `vec3(0.0, ${glslFloat(JAW_HINGE.y)}, ${glslFloat(JAW_HINGE.z)})`
const JAW_NORMAL = 'objectNormal = bustJawTurn(objectNormal, bustJawShare(position, normal));'
const JAW_POSITION = `transformed = ${JAW_HINGE_POINT} + bustJawTurn(transformed - ${JAW_HINGE_POINT}, bustJawShare(position, normal));`

// The head's turn: an axis and an angle, which each vertex takes its share
// of (Rodrigues' rotation), about the pivot in the neck.
const HEAD = /* glsl */ `
uniform vec3 uHeadAxis;
uniform float uHeadAngle;

float bustHeadShare(vec3 p) {
  return smoothstep(${glslFloat(HEAD_SHARE_FROM)}, ${glslFloat(HEAD_SHARE_TO)},
    dot(p - ${glslVec3(HEAD_PIVOT)}, ${glslVec3(HEAD_LINE_NORMAL)}));
}

vec3 bustTurn(vec3 v, float share) {
  float a = uHeadAngle * share;
  float c = cos(a);
  return v * c + cross(uHeadAxis, v) * sin(a) + uHeadAxis * dot(uHeadAxis, v) * (1.0 - c);
}
`

const TURN_NORMAL = 'objectNormal = bustTurn(objectNormal, bustHeadShare(position));'
const TURN_POSITION = `transformed = ${glslVec3(HEAD_PIVOT)} + bustTurn(transformed - ${glslVec3(HEAD_PIVOT)}, bustHeadShare(position));`

// The lid, over the paint. Where it is is read off the bind pose, so it
// rides with the head. Its edge runs corner to corner of the opening, as a
// lid's does, coming down from the top of the outline to its bottom.
const LID = /* glsl */ `
varying vec3 vBustPosition;
uniform float uBlink;

float bustHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float bustNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 s = f * f * (3.0 - 2.0 * f);
  return mix(mix(bustHash(i), bustHash(i + vec2(1.0, 0.0)), s.x),
    mix(bustHash(i + vec2(0.0, 1.0)), bustHash(i + vec2(1.0, 1.0)), s.x), s.y);
}

// How much of this point the lid covers, how near its edge it is, how
// light the fur strand on it is there, and how much of it the lid has
// dried and flattened (which reaches further than its colour).
vec4 bustLid(vec3 p, vec3 centre, vec3 n, vec3 across, vec3 up, vec2 halfSize) {
  vec3 d = p - centre;
  vec2 q = vec2(dot(d, across), dot(d, up)) / (halfSize * ${glslFloat(LID_REACH)});
  float onEye = step(abs(dot(d, n)), ${glslFloat(EYE_DEPTH)});
  float rim = (1.0 - smoothstep(${glslFloat(1 - RIM_SOFTNESS)}, 1.0, length(q))) * onEye;
  float dry = (1.0 - smoothstep(1.0, ${glslFloat(DRY_REACH)}, length(q))) * onEye;
  float edge = (1.0 - 2.0 * uBlink) * sqrt(max(1.0 - q.x * q.x, 0.0));
  float past = q.y - edge;
  float aa = fwidth(past) + 1e-4;
  float shut = smoothstep(-aa, aa, past);
  float strands = ${glslFloat(FUR_STRANDS)};
  float fur = 0.7 + 0.45 * bustNoise(q * vec2(3.0, strands))
    + 0.25 * (bustNoise(q * vec2(7.0, strands * 2.25) + 13.0) - 0.5);
  return vec4(shut * rim, 1.0 - smoothstep(0.0, ${glslFloat(LASH_WIDTH)}, past), fur, shut * dry);
}
`

const eyeCall = (eye) => {
  const { n, across, up } = eyeAxes(eye)
  return `bustLid(vBustPosition, ${glslVec3(eye.centre)}, ${glslVec3(n)}, ${glslVec3(across)}, ${glslVec3(up)}, vec2(${glslFloat(eye.halfWidth)}, ${glslFloat(eye.halfHeight)}))`
}

// Only while a blink is on: uBlink is the same for every pixel, so the
// branch doesn't upset the derivatives the edge is smoothed with.
const SHUT = /* glsl */ `
float bustDry = 0.0;
if (uBlink > 0.0) {
  vec4 lidA = ${eyeCall(EYES[0])};
  vec4 lidB = ${eyeCall(EYES[1])};
  vec4 lidHere = lidA.w > lidB.w ? lidA : lidB;
  bustDry = lidHere.w;
  vec3 lidColour = diffuse * ${glslVec3(lid.toArray())} * lidHere.z * (1.0 - 0.5 * lidHere.y);
  diffuseColor.rgb = mix(diffuseColor.rgb, lidColour, lidHere.x);
}
`

// The open mouth: where the drop has stretched the surface, its area grown
// past its own in the bind pose — the lips' edge, pulled down after the jaw.
// The rest of the jaw only turns. Only while it's open, like the lid.
const MOUTH = /* glsl */ `
float bustMouth = 0.0;
if (uJaw > 0.0) {
  vec3 jawedArea = cross(dFdx(vBustJawed), dFdy(vBustJawed));
  vec3 bindArea = cross(dFdx(vBustPosition), dFdy(vBustPosition));
  float stretch = length(jawedArea) / max(length(bindArea), 1e-8);
  bustMouth = smoothstep(${glslFloat(MOUTH_STRETCH[0])}, ${glslFloat(MOUTH_STRETCH[1])}, stretch);
  diffuseColor.rgb = mix(diffuseColor.rgb, ${glslVec3(mouth.toArray())}, bustMouth);
}
`

const LID_ROUGH = `roughnessFactor = mix(roughnessFactor, ${glslFloat(LID_ROUGHNESS)}, bustDry);
roughnessFactor = mix(roughnessFactor, ${glslFloat(MOUTH_ROUGHNESS)}, bustMouth);`
const LID_FLAT = 'normal = normalize(mix(normal, nonPerturbedNormal, max(bustDry, bustMouth)));'

// The bust's head turning, its eyes blinking and its jaw snapping, on its
// own material and, for the candle's shadow, on a distance material of its
// own that turns the head and drops the jaw the same way. The uniforms are
// the hook's, shared by both, so writing them each frame moves both (see
// hooks/useBustMotion). The jaw drops in the bind pose and the head turns
// what it dropped: the mouth turns with the head.
export function animateBust(mesh, uniforms) {
  const { material } = mesh
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${HEAD}\n${JAW}\nvarying vec3 vBustPosition;\nvarying vec3 vBustJawed;`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n${JAW_NORMAL}\n${TURN_NORMAL}`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\nvBustPosition = position;\n${JAW_POSITION}\nvBustJawed = transformed;\n${TURN_POSITION}`
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${LID}\nuniform float uJaw;\nvarying vec3 vBustJawed;`)
      .replace('#include <map_fragment>', `#include <map_fragment>\n${SHUT}\n${MOUTH}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${LID_ROUGH}`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\n${LID_FLAT}`)
  }
  material.customProgramCacheKey = () => 'shourdo-bust'
  material.needsUpdate = true

  const distance = new THREE.MeshDistanceMaterial()
  distance.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${HEAD}\n${JAW}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${JAW_POSITION}\n${TURN_POSITION}`)
  }
  distance.customProgramCacheKey = () => 'shourdo-bust-distance'
  mesh.customDistanceMaterial = distance
}
