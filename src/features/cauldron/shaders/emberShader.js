// The orbs off the cauldron, drawn as points. Each is shaded as a small
// lit sphere — a hot core, a body that rounds off toward its edge, and a
// light falling on it from above — rather than the flat soft dot the dust
// is: from the room it reads as a bead of fire, not a speck.
export const emberVertexShader = /* glsl */ `
  uniform float uScale;
  attribute float aSize;
  attribute float aAlpha;
  attribute float aHue;
  varying float vAlpha;
  varying float vHue;

  void main() {
    vAlpha = aAlpha;
    vHue = aHue;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // aSize is metres across; uScale turns that into pixels at unit depth.
    gl_PointSize = aSize * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

export const emberFragmentShader = /* glsl */ `
  uniform vec3 uOrange;
  uniform vec3 uYellow;
  uniform vec3 uHot;
  varying float vAlpha;
  varying float vHue;

  void main() {
    // The point's square as a disc, y up.
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    p.y = -p.y;
    float r2 = dot(p, p);
    if (r2 > 1.0) discard;

    // The sphere's surface under this fragment, lit from above and a little
    // to the side: the top of the bead bright, its underside dimmer.
    vec3 n = vec3(p, sqrt(1.0 - r2));
    float lit = 0.55 + 0.45 * max(dot(n, normalize(vec3(-0.35, 0.6, 0.72))), 0.0);
    // Hottest at the heart, and a soft limb instead of a hard rim.
    float core = exp(-r2 * 4.0);
    float body = 1.0 - smoothstep(0.7, 1.0, sqrt(r2));

    vec3 col = mix(mix(uOrange, uYellow, vHue), uHot, core * 0.75);
    gl_FragColor = vec4(col * lit * body * (0.55 + 0.45 * core) * vAlpha, 1.0);
  }
`
