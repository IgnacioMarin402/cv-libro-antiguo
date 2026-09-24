import {
  ROBE,
  FUR,
  RED_HUE,
  RED_HUE_FULL,
  RED_HUE_FADE,
  RED_SAT_FROM,
  RED_SAT_FULL,
  RED,
  QUARTER,
  BASE_COLOR_FACTOR,
  TOP_FROM_Y,
  TOP_FULL_Y,
  DARK_VALUE_FULL,
  DARK_VALUE_FADE,
  hexToLinear,
  luminance,
} from '../domain/cloth'

const glslFloat = (x) => (Number.isInteger(x) ? `${x}.0` : `${x}`)
const glslVec3 = (v) => `vec3(${v.map(glslFloat).join(', ')})`
const refLuminance = (hex) => glslFloat(luminance(hexToLinear(hex)) * BASE_COLOR_FACTOR)

// The whole palette is fixed, so it goes in as constants rather than
// uniforms: nothing here animates.
const FRAGMENT_HEAD = /* glsl */ `
varying float vTableWorldY;

vec3 tableRgbToHsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
`

// Which texels to repaint is read in sRGB hue, saturation and value, where
// the thresholds were measured off the texture; the repaint itself is done
// in linear light, scaling each palette colour by the texel's luminance.
const RECOLOR = /* glsl */ `
{
  vec3 srgb = pow(max(diffuseColor.rgb, 0.0), vec3(1.0 / 2.2));
  vec3 hsv = tableRgbToHsv(srgb);

  float hueOff = abs(fract(hsv.x - ${glslFloat(RED_HUE / 360)} + 0.5) - 0.5) * 360.0;
  float red = (1.0 - smoothstep(${glslFloat(RED_HUE_FULL)}, ${glslFloat(RED_HUE_FADE)}, hueOff))
    * smoothstep(${glslFloat(RED_SAT_FROM)}, ${glslFloat(RED_SAT_FULL)}, hsv.y);

  float quarter = smoothstep(${glslFloat(TOP_FROM_Y)}, ${glslFloat(TOP_FULL_Y)}, vTableWorldY)
    * (1.0 - smoothstep(${glslFloat(DARK_VALUE_FULL)}, ${glslFloat(DARK_VALUE_FADE)}, hsv.z))
    * (1.0 - red);

  float luma = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 asRobe = ${glslVec3(hexToLinear(ROBE))} * (luma / ${refLuminance(RED)});
  vec3 asFur = ${glslVec3(hexToLinear(FUR))} * (luma / ${refLuminance(QUARTER)});

  diffuseColor.rgb = mix(diffuseColor.rgb, min(asRobe, vec3(1.0)), red);
  diffuseColor.rgb = mix(diffuseColor.rgb, min(asFur, vec3(1.0)), quarter);
}
`

// Repaints the cloth on the GLB's own material, leaving its maps alone:
// the damask, the weave's shading and the braid all come through, only in
// the cat's colours (see domain/cloth).
export function recolorCloth(material) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vTableWorldY;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvTableWorldY = (modelMatrix * vec4(transformed, 1.0)).y;',
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENT_HEAD}`)
      .replace('#include <map_fragment>', `#include <map_fragment>\n${RECOLOR}`)
  }
  material.customProgramCacheKey = () => 'table-cloth-recolor'
  material.needsUpdate = true
}
