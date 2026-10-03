// A dog's name, written in light (see domain/names). The texture carries
// only shapes — the letters, a wide halo, a tight one (see
// textures/nameTexture) — and this lights them: a front sweeps across the
// name leaving the letters behind it, near-white where it has just passed
// and cooling into gilt; once written the gilt glints now and then and the
// halo breathes.
//
// The letters cover what's behind them and the halo only adds light to it,
// so the colour comes out premultiplied: letters as colour × coverage with
// their coverage as alpha, halo as colour with none. With the material's
// premultipliedAlpha, three blends that as ONE, ONE_MINUS_SRC_ALPHA — both
// at once, in one pass. Written straight to the screen, like the cauldron's
// orbs: not lit, not tone mapped.
export const nameVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const nameFragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  // Lengths across the name, in uv: where the front is, how soft it is,
  // how far behind it the light stays hot, and how far it leans forward
  // per unit up.
  uniform float uFront;
  uniform float uSoftness;
  uniform float uCooling;
  uniform float uSlant;
  // The letters' foot and head, up the name (uv).
  uniform vec2 uLetters;
  uniform float uPresence;
  uniform float uTime;
  uniform float uPhase;
  uniform vec3 uGiltDeep;
  uniform vec3 uGiltPale;
  uniform vec3 uWritingLight;
  uniform vec3 uHalo;
  // Halo at rest, halo under the writing light, tight bloom.
  uniform vec3 uHaloStrength;
  // Glint: period and crossing time (s), band width (uv), gain.
  uniform vec4 uShimmer;
  // Halo breath: period (s), depth.
  uniform vec2 uBreath;
  varying vec2 vUv;

  void main() {
    vec3 ink = texture2D(uMap, vUv).rgb;

    // Distance behind the front, measured along a line leaning like a
    // quill stroke through the middle of the letters.
    float middle = 0.5 * (uLetters.x + uLetters.y);
    float x = vUv.x - (vUv.y - middle) * uSlant;
    float behind = uFront - x;
    float written = smoothstep(-uSoftness, uSoftness, behind);
    float heat = written * exp(-max(behind, 0.0) / uCooling);

    vec3 gilt = mix(uGiltDeep, uGiltPale, smoothstep(uLetters.x, uLetters.y, vUv.y));
    float cycle = mod(uTime + uPhase, uShimmer.x);
    float sweep = mix(-uShimmer.z, 1.0 + uShimmer.z, cycle / uShimmer.y);
    float glint = cycle < uShimmer.y ? exp(-pow((x - sweep) / uShimmer.z, 2.0)) : 0.0;
    vec3 letter = mix(gilt * (1.0 + glint * uShimmer.w), uWritingLight, heat);

    // The halo dies out before the plane's edge, so its tail never shows
    // the rectangle it's drawn on.
    float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x)
      * smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
    float breath = 1.0 + uBreath.y * sin(6.2831853 * uTime / uBreath.x + uPhase);
    float glow = ink.g * (uHaloStrength.x * breath + uHaloStrength.y * heat) + ink.b * uHaloStrength.z;

    float alpha = ink.r * written * uPresence;
    gl_FragColor = vec4(letter * alpha + uHalo * glow * edge * written * uPresence, alpha);
  }
`
