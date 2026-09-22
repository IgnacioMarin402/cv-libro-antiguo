// Procedural candle flame, drawn on a card that turns about the flame's own
// axis to face the viewer. The vertex stage bends the card (the draft's
// lean grows with the square of the height, so the tip swings and the base
// stays on the wick) and runs a faint ripple up it. The fragment stage
// paints a real candle flame's anatomy on a teardrop: a blue cup at the
// base, the dark zone around the wick, the yellow luminous body with a
// white-hot heart, a redder tip, and a thin sheath of glow around it all.
export const flameVertexShader = /* glsl */ `
  uniform vec3 uAxis;
  uniform vec3 uSide;
  uniform vec3 uLean;
  uniform vec3 uNudge;
  uniform float uHeight;
  uniform float uWidth;
  uniform float uTime;
  uniform float uFlutter;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    float v = uv.y;
    // A wave travelling up the body, pinned at the base: calm air keeps it
    // to a fraction of a millimetre, a gust lets it wag the tip.
    float ripple = 0.06 * uFlutter * v * v * sin(v * 7.0 - uTime * 6.0);
    vec3 p = uAxis * (v * uHeight)
           + uLean * (v * v)
           + uSide * ((uv.x - 0.5 + ripple) * uWidth)
           + uNudge;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

export const flameFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uBrightness;
  varying vec2 vUv;

  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                    + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Half-width of the teardrop at height y (0 base, 1 tip): a rounded
  // base, the belly about 30% of the way up, drawn out to a point.
  float halfWidth(float y) {
    return 0.58 * sin(3.14159265 * pow(clamp(y, 0.0, 1.0), 0.58));
  }

  void main() {
    // Flame space: x across the card in [-1, 1], y from the body's base
    // (0) to its tip (1). The card's margins below and above are where
    // the sheath fades out.
    float x = (vUv.x - 0.5) * 2.0;
    float y = (vUv.y - 0.06) / 0.88;

    // A faint shimmer on the outline, rising with the hot gas and growing
    // toward the tip: enough to keep the edge alive, never enough to break
    // the silhouette the way the old turbulence did.
    x += 0.05 * y * snoise(vec2(x * 1.3, y * 2.5 - uTime * 1.8));

    float d = abs(x) / max(halfWidth(y), 0.001);

    // The body, with the soft-but-defined edge of a laminar flame.
    float body = smoothstep(1.0, 0.7, d);
    // The luminous zone starts a little above the base...
    float lum = smoothstep(0.95, 0.3, d) * smoothstep(0.08, 0.3, y);
    // ...and is hottest low in the belly, where it burns white.
    float heart = smoothstep(0.6, 0.0, d) * smoothstep(0.16, 0.34, y) * smoothstep(0.78, 0.4, y);
    // Around the wick the vapour hasn't lit yet: a darker hollow.
    float dark = smoothstep(0.55, 0.0, d) * smoothstep(0.3, 0.1, y);
    // The blue cup, at the base and strongest toward its rim.
    float blue = body * smoothstep(0.0, 0.05, y) * smoothstep(0.3, 0.06, y) * (0.4 + 0.6 * smoothstep(0.2, 0.9, d));
    // A thin sheath of glow hugging the whole teardrop, past its base and tip.
    float sw = 0.58 * sin(3.14159265 * pow(clamp(y * 0.84 + 0.08, 0.0, 1.0), 0.58)) + 0.14;
    float sheath = smoothstep(1.0, 0.0, abs(x) / sw) * smoothstep(-0.07, 0.1, y) * smoothstep(1.1, 0.72, y);

    float heat = body * 0.42 + lum * 0.35 + heart * 0.28;
    heat *= 1.0 - 0.55 * dark;
    // The tip is the coolest, thinnest part of the flame: redder and dimmer,
    // and gone before the teardrop's point narrows under a pixel — drawn to
    // the end, it broke into loose dots above the flame.
    heat *= (1.0 - 0.4 * smoothstep(0.55, 1.0, y)) * smoothstep(1.0, 0.88, y);
    heat = clamp(heat, 0.0, 1.0);

    vec3 col = mix(vec3(0.62, 0.12, 0.02), vec3(1.0, 0.42, 0.08), smoothstep(0.0, 0.35, heat));
    col = mix(col, vec3(1.0, 0.7, 0.28), smoothstep(0.35, 0.7, heat));
    col = mix(col, vec3(1.0, 0.95, 0.82), smoothstep(0.7, 1.0, heat));

    vec3 light = col * heat
               + vec3(0.16, 0.3, 1.0) * blue * 0.32
               + vec3(1.0, 0.45, 0.12) * sheath * 0.1;
    gl_FragColor = vec4(light * uBrightness, 1.0);
  }
`
