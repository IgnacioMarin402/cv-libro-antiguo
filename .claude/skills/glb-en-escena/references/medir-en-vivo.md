# Medir en la escena viva

Fragmentos para pegar en `javascript_tool` (navegador integrado) con `npm run dev`
abierto. Todos se usaron y funcionaron el 2026-10-03 (la pluma, la jarra y el casco
sobre el aparador). Cada llamada a `javascript_tool` muere a los 45 s: partir las
esperas largas en varias llamadas.

## Índice

1. Preparar el panel (si está oculto o congelado)
2. Store de R3F y THREE
3. Ver un GLB aparte, en un estudio
4. Partes de un modelo por altura
5. La superficie de un mueble (rayos hacia abajo)
6. El objeto ya colocado: caja y contacto
7. Encuadre en los planos fijos
8. Barrido de la órbita contra un objeto
9. Coste por frame
10. Clics y hover sintéticos

## 1. Preparar el panel

El panel suele estar oculto: rAF no dispara y R3F no monta (ver la memoria del
proyecto sobre el panel congelado). Navegar, sustituir rAF, capturar errores desde el
primer instante y forzar un render con una captura — en un `browser_batch`:

```js
// 1) navigate a la URL de preview_start; 2) esto; 3) computer screenshot (scale 0.3)
window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16)
window.cancelAnimationFrame = (id) => clearTimeout(id)
window.__errors = []
const ce = console.error.bind(console)
console.error = (...a) => { window.__errors.push(String(a[0]).slice(0, 160)); ce(...a) }
window.addEventListener('error', (e) => window.__errors.push('uncaught: ' + e.message))
window.addEventListener('unhandledrejection', (e) => window.__errors.push('rejection: ' + e.reason))
```

`read_console_messages` arrastra mensajes de cargas anteriores (y los errores de orden
de hooks que deja el HMR al cambiar un hook en caliente): para saber si una carga limpia
da errores, mirar `window.__errors`. Las transiciones y animaciones CSS sólo avanzan al
capturar: la primera captura tras un cambio puede salir vieja, repetirla. Un
`resize_window` tampoco llega al canvas hasta que se captura.

## 2. Store de R3F y THREE

```js
const url = (re) => performance.getEntriesByType('resource').map((e) => e.name).find((n) => re.test(n))
const fiber = await import(url(/react-three_fiber/))
const THREE = await import(url(/deps\/three\.js/))
window.__THREE = THREE
window.__st = () => [...fiber._roots.values()][0].store.getState()
// Esperar a que termine la entrada: cámara en el plano de reposo (0.35, 0.62, 0.95).
window.__st().camera.position.toArray()
```

Los objetos montados son hijos directos de la escena: se encuentran por su posición
del layout, p. ej.
`s.scene.children.find((c) => Math.abs(c.position.x - 0.7) < 2e-3 && Math.abs(c.position.z + 0.3) < 2e-3)`.

## 3. Ver un GLB aparte, en un estudio

Para saber qué es y dónde tiene el frente, antes de escribir nada:

```js
const { GLTFLoader } = await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js')
const { MeshoptDecoder } = await import('/node_modules/three/examples/jsm/libs/meshopt_decoder.module.js')
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder)
const gltf = await new Promise((res, rej) => loader.load('/models/x.glb', res, undefined, rej))
const s = window.__st(); s.set({ frameloop: 'never' })
const studio = new THREE.Scene(); studio.background = new THREE.Color(0x3a3a3a)
studio.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.2))
const sun = new THREE.DirectionalLight(0xffffff, 2.5); sun.position.set(2, 3, 2); studio.add(sun)
studio.add(gltf.scene)
const cam = new THREE.PerspectiveCamera(38, s.size.width / s.size.height, 0.01, 50)
cam.position.set(0, 1.6, 2.6); cam.lookAt(0, 0.35, 0)   // desde +z: el frente de Tripo
const tone = s.gl.toneMapping; s.gl.toneMapping = THREE.NoToneMapping
s.gl.render(studio, cam); s.gl.toneMapping = tone
// → captura. Después: s.set({ frameloop: 'always' })
```

## 4. Partes de un modelo por altura

Un modelo de Tripo es una sola malla: para medir una parte (el tintero junto a la
pluma) se mira qué ocupa cada franja de altura.

```js
let mesh; gltf.scene.traverse((o) => { if (o.isMesh) mesh = o })
const pos = mesh.geometry.attributes.position; const v = new THREE.Vector3(); const bands = {}
for (let i = 0; i < pos.count; i += 5) {
  v.fromBufferAttribute(pos, i)
  const k = Math.min(9, Math.floor(v.y / 0.04)); (bands[k] ??= new THREE.Box3()).expandByPoint(v)
}
Object.fromEntries(Object.entries(bands).map(([k, b]) =>
  [`y${(k * 0.04).toFixed(2)}`, [b.min.x, b.max.x, b.min.z, b.max.z].map((x) => +x.toFixed(2)).join(' ')]))
```

## 5. La superficie de un mueble

Antes de poner algo encima: dónde es plana y a qué altura, y dónde hay adornos. Rayos
verticales sobre una rejilla; la altura que sale es sobre el suelo (que está en
`y = -1.011`).

```js
const s = window.__st(); const furniture = /* el grupo del mueble */
furniture.updateMatrixWorld(true)
const rc = new THREE.Raycaster(); const down = new THREE.Vector3(0, -1, 0)
const box = new THREE.Box3().setFromObject(furniture); const rows = []
for (let x = box.min.x; x <= box.max.x; x += 0.05) {
  const row = []
  for (let z = box.min.z; z <= box.max.z; z += 0.1) {
    rc.set(new THREE.Vector3(x, 3, z), down)
    const hit = rc.intersectObject(furniture, true)[0]
    row.push(hit ? (hit.point.y + 1.011).toFixed(2) : '----')
  }
  rows.push(x.toFixed(2) + ': ' + row.join(' '))
}
rows
```

Luego, con paso de 1 cm sólo bajo la huella del objeto, la altura exacta: ésa es la
que se exporta del dominio del mueble (`CABINET_TOP_HEIGHT = 1.964` se midió así; el
comentario del modelo daba 1,972).

## 6. El objeto ya colocado

```js
const b = new THREE.Box3().setFromObject(obj, true)   // true: vértices ya transformados
// Apoyo: b.min.y contra la superficie (0 en la mesa). Holguras: b contra el barrido
// del libro (x ≤ 0.393 a su derecha; ±0.2635 en z) y contra las cajas de los vecinos.
let tris = 0; obj.traverse((o) => { if (o.isMesh) tris += o.geometry.index.count / 3 })
```

## 7. Encuadre en los planos fijos

```js
const shots = await import('/src/features/camera/domain/shots.js')
const cam = new THREE.PerspectiveCamera(38, 16 / 9, 0.02, 50)
const ndc = (shot, p) => { cam.position.copy(shot.position); cam.lookAt(shot.target); cam.updateMatrixWorld()
  const v = new THREE.Vector3(...p).project(cam); return [+v.x.toFixed(2), +v.y.toFixed(2)] }
// |x| y |y| ≤ 1 es dentro del cuadro. Probar SHOTS.intro, SHOTS.rest y SHOTS.open.
```

## 8. Barrido de la órbita contra un objeto

Dónde puede llegar la lente: a hasta 3,3 m del objetivo, ángulo polar hasta 1,45, y el
objetivo en el libro (cerrado: `SHOTS.rest.target`; abierto: centro ±0,33 en x y ±0,26
en z por WASD, con distancia mínima 0,18).

```js
const v = new THREE.Vector3(); const pts = []; const pbox = new THREE.Box3()
obj.traverse((o) => { if (!o.isMesh) return; const p = o.geometry.attributes.position
  for (let i = 0; i < p.count; i += 8) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); pts.push(v.x, v.y, v.z); pbox.expandByPoint(v) } })
const near = (x, y, z, cap = 0.6) => { const dx = Math.max(pbox.min.x - x, 0, x - pbox.max.x), dy = Math.max(pbox.min.y - y, 0, y - pbox.max.y), dz = Math.max(pbox.min.z - z, 0, z - pbox.max.z)
  if (dx * dx + dy * dy + dz * dz > cap * cap) return cap; let best = cap * cap
  for (let k = 0; k < pts.length; k += 3) { const ex = pts[k] - x, ey = pts[k + 1] - y, ez = pts[k + 2] - z; best = Math.min(best, ex * ex + ey * ey + ez * ez) } return Math.sqrt(best) }
const T = [0.195, 0.025, -0.026]; let min = Infinity, touching = 0, total = 0
for (let th = 0; th < 360; th += 6) for (let ph = 0.02; ph <= 1.451; ph += 0.07) for (let r = 0.35; r <= 3.301; r += 0.08) {
  const t = th * Math.PI / 180; const x = T[0] + r * Math.sin(ph) * Math.sin(t), y = T[1] + r * Math.cos(ph), z = T[2] + r * Math.sin(ph) * Math.cos(t)
  const d = near(x, y, z); total++; min = Math.min(min, d); if (d < 0.02) touching++ }
({ minCm: +(min * 100).toFixed(1), touchingPct: +(touching / total * 100).toFixed(2) })
```

Si el objeto está cerca de la ruta de la cámara hacia el retrato (lado este de la mesa,
pared norte), volver a medir esa ruta: `camera/domain/focus.js` dice cómo y qué cifras
cumple.

## 9. Coste por frame

Incluye el pase de sombra de la vela, que dibuja seis veces todo lo que proyecta:

```js
const s = window.__st(); s.set({ frameloop: 'never' }); const gl = s.gl
const shots = await import('/src/features/camera/domain/shots.js')
const cam = new THREE.PerspectiveCamera(38, 16 / 9, 0.02, 50)
const auto = gl.info.autoReset; gl.info.autoReset = false
const measure = (shot) => { cam.position.copy(shot.position); cam.lookAt(shot.target); cam.updateMatrixWorld()
  gl.info.reset(); gl.shadowMap.needsUpdate = true; gl.render(s.scene, cam)
  return `${gl.info.render.calls} calls / ${Math.round(gl.info.render.triangles / 1000)}k tris` }
obj.visible = true; const con = measure(shots.SHOTS.rest)
obj.visible = false; const sin = measure(shots.SHOTS.rest)
obj.visible = true; gl.info.autoReset = auto; s.set({ frameloop: 'always' })
({ con, sin })
```

Referencia (2026-10-03): la escena sin la pluma ni la jarra, 4,2 M triángulos por frame;
con ellas a malla completa (1,9 M cada una), 14,0 M.

## 10. Clics y hover sintéticos

R3F lee `offsetX/offsetY`, que el constructor del evento no acepta: definirlos a mano.
OrbitControls necesita `setPointerCapture` stubeado.

```js
const canvas = document.querySelector('canvas')
canvas.setPointerCapture = () => {}; canvas.releasePointerCapture = () => {}
const fire = (type, ox, oy, extra = {}) => {
  const Ctor = type === 'click' ? MouseEvent : type === 'wheel' ? WheelEvent : PointerEvent
  const e = new Ctor(type, { bubbles: true, cancelable: true, clientX: ox, clientY: oy, button: 0,
    buttons: type === 'pointerup' || type === 'click' ? 0 : 1, pointerId: 1, pointerType: 'mouse', isPrimary: true, ...extra })
  Object.defineProperty(e, 'offsetX', { get: () => ox }); Object.defineProperty(e, 'offsetY', { get: () => oy })
  canvas.dispatchEvent(e)
}
// Clic: pointermove → pointerdown → pointerup → click en el mismo punto.
// Arrastre para orbitar: pointerdown, varios pointermove, pointerup (+ espera).
// Alejar: fire('wheel', x, y, { deltaY: 900, buttons: 0 }).
```

Para probar la lógica sin raycast (p. ej. con un viewport donde el objeto no se ve):
`mesh.__r3f.handlers.onClick({ stopPropagation() {} })`. El hover real se puede probar
con la acción `hover` del panel, pero los objetos que se mueven (el corazón) se van
antes de que llegue el ratón: mejor el `pointermove` sintético en su posición del
momento.
