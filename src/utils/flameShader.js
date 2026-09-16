// Procedural candle flame: animated simplex-noise turbulence masked into a
// pinch-belly-taper silhouette (narrow at the wick, wide at the belly,
// narrow at the tip), color-graded from ember red to white-hot.
export const flameVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const flameFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uFlicker;
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

  float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5   * snoise(p); p *= 2.02;
    f += 0.25  * snoise(p); p *= 2.03;
    f += 0.125 * snoise(p);
    return f;
  }

  void main() {
    float y = vUv.y;

    float sway = 0.05 * sin(y * 4.0 + uTime * 1.3) * smoothstep(0.0, 0.5, y);
    float belly = smoothstep(0.0, 0.18, y) * smoothstep(1.05, 0.32, y);
    float halfWidth = 0.44 * belly + 0.015;
    float dx = abs(vUv.x - 0.5 - sway);
    float edge = smoothstep(halfWidth, halfWidth * 0.35, dx);

    vec2 noiseUv = vec2(vUv.x * 2.4, vUv.y * 2.6 - uTime * 1.6);
    float n = fbm(noiseUv) * 0.5 + 0.5;

    float shape = edge * belly;
    float intensity = clamp(n * shape * 1.7 - 0.15, 0.0, 1.0);

    vec3 col = mix(vec3(0.55, 0.04, 0.0), vec3(1.0, 0.28, 0.02), smoothstep(0.0, 0.4, intensity));
    col = mix(col, vec3(1.0, 0.62, 0.12), smoothstep(0.35, 0.7, intensity));
    col = mix(col, vec3(1.0, 0.96, 0.75), smoothstep(0.65, 0.95, intensity));

    float alpha = clamp(intensity * 1.3, 0.0, 1.0) * shape * uFlicker;
    gl_FragColor = vec4(col * uFlicker, alpha);
  }
`
