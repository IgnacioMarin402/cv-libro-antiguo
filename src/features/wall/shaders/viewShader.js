// The view out of the window (see domain/view): each fragment of the panel
// behind the hole shows the photo's pixel for the direction the camera
// looks through it, as if the photo were the landscape at infinity.
export const viewVertexShader = /* glsl */ `
  varying vec3 vDir;

  void main() {
    // From the lens to this vertex, in the panel's own frame — out of the
    // window is -z. Affine in the position, so it interpolates exactly.
    vec3 eye = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
    vDir = position - eye;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const viewFragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTanHalfFov;
  uniform float uPitch;
  varying vec3 vDir;

  void main() {
    // Into the photo's frame: its axis looks out of the window, tipped
    // uPitch off level; then projected the way a rectilinear lens does.
    float c = cos(uPitch);
    float s = sin(uPitch);
    vec3 d = vec3(vDir.x, vDir.y * c + vDir.z * s, vDir.y * s - vDir.z * c);
    vec2 uv = 0.5 + d.xy / d.z / (2.0 * uTanHalfFov);
    gl_FragColor = vec4(texture2D(uMap, uv).rgb, 1.0);
    #include <colorspace_fragment>
  }
`
