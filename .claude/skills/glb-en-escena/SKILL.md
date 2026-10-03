---
name: glb-en-escena
description: Cómo agregar a la escena 3D del libro antiguo un modelo GLB nuevo — o mover uno que ya está — de principio a fin. Cubre inspeccionar el archivo, pasarlo por scripts/shrink-glb.mjs y scripts/pack-glb.mjs, darle tamaño real, crear su feature y colocarlo en src/app/scene/layout.js con holguras medidas contra el libro, los vecinos y la cámara. Termina montándolo, documentándolo y verificándolo en el navegador. Úsala siempre que el usuario pase o mencione un .glb (de Descargas, de Tripo, "agrega este modelo", "pon esto en la mesa / en la pared / encima del aparador"), o pida cambiar de sitio un objeto importado de la escena (el casco, el escudo, la jarra, la pluma…), aunque no diga "GLB".
---

# Un GLB en la escena

Receta para meter un modelo importado en el cuarto (o cambiarlo de sitio) sin romper
nada de lo que ya está medido. Salió de incorporar la pluma con su tintero y la jarra
del dragón, y de subir el casco al aparador (2026-10-03). Léela entera antes de tocar
nada. Los fragmentos de código para medir en la escena viva están en
`references/medir-en-vivo.md`, y el inspector de archivos en `scripts/glbinfo.mjs`.

## Por qué se trabaja así

- **Se mide, no se estima.** En esta escena el ojo y la pose estática se han equivocado
  muchas veces (ver "Medir antes de tocar" en `CLAUDE.md`). Cada constante de tamaño o
  posición lleva en su comentario el número medido que la justifica: es la memoria del
  proyecto, y lo que el usuario valora.
- **Los hechos los compruebo yo; el gusto lo juzga él.** El navegador sirve para saber
  si carga, si apoya, si atraviesa algo o si la cámara choca. Si "se ve bien" lo decide
  el usuario: descríbele qué mirar y no afirmes que queda bonito.
- **Sólo lo pedido.** Si dice dónde va, va ahí. Si no lo dice, elige un sitio razonable
  y explícalo en una línea. Él lo ajusta después: así es como se colocó casi todo el
  cuarto (ver los comentarios de `layout.js`, "was asked closer…").
- **El aspecto pesa más que el tamaño del archivo.** El modelo pasa por los dos scripts
  del proyecto y nada más. No simplifiques la malla por tu cuenta: mide lo que cuesta y
  ofrécelo, como se hizo con el sofá (que sí lo pidió).

## Pasos

### 1. Inspeccionar el archivo

```bash
node .claude/skills/glb-en-escena/scripts/glbinfo.mjs "<ruta al .glb>"
```

Anota tres cosas:
- **Triángulos.** Los de Tripo llegan con 1–2 M aunque sean una taza; en toda la escena
  hay unos 2,5 M.
- **Mapas.** Vienen a 4096 u 8192 px; `shrink-glb` los baja.
- **`doubleSided`.** Decide las sombras (paso 5).

Tripo exporta un solo mesh de alrededor de una unidad, apoyado en `y = 0` y mirando a
`+z`.

### 2. Copiarlo y prepararlo

Nombre en kebab-case y en inglés, como los demás (`dragon-mug.glb`, `quill-pen.glb`).
Los dos scripts van en este orden, y el segundo necesita `.tools/gltfpack.exe`:

```bash
cp "<origen>" public/models/<nombre>.glb
node scripts/shrink-glb.mjs public/models/<nombre>.glb
node scripts/pack-glb.mjs public/models/<nombre>.glb
```

Apunta los tamaños antes y después que imprimen: la jarra pasó de 74,7 a 13,2 MB. Se
carga con `useGLTF` de `@/shared/three/useGLTF`, que trae el decodificador de meshopt;
`useLoader(GLTFLoader, …)` no sirve.

### 3. Verlo antes de escribir nada

Renderízalo aparte, en un estudio (referencia §3), y captura la imagen. Así sabes qué
es exactamente (la "pluma" resultó ser pluma más tintero en una sola malla), dónde está
su frente y qué parte da la altura.

### 4. Darle su tamaño real

La escala sale de lo que el objeto es en la realidad, no de cuánto ocupa el archivo:
una jarra mide 15 cm y un tintero unos 7. Si la altura del modelo la pone una parte
concreta, mídela por franjas (referencia §4). La pluma medía 1,28 unidades y el tintero
0,36, así que a escala 0,2 salen 25,5 cm y 7,2 cm. Si va encima o al lado de algo que
ya existe, compara con sus medidas (las páginas del libro miden 39 × 52,7 cm).

### 5. La feature

Una carpeta por objeto, `src/features/<objeto>/`, como el casco:

- `domain/<objeto>.js`: medidas del modelo tal como sale del archivo (medidas, no
  redondeadas al ojo), la escala con su porqué, y lo que el layout necesite (medio
  ancho, desplazamiento a la pared, etc.). Sin React ni three.js.
- `<Objeto>.jsx`: el componente, con su propio `Suspense`.
- `index.js`: exporta el componente y sólo las constantes que use el layout.

```jsx
import { Suspense, useLayoutEffect } from 'react'
import { useGLTF } from '@/shared/three/useGLTF'
import { X_SCALE } from './domain/x'

const MODEL_URL = '/models/x.glb'

function XModel(props) {
  const { scene } = useGLTF(MODEL_URL)

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true // sólo si es de una cara: ver abajo
    })
  }, [scene])

  return (
    <group {...props} scale={X_SCALE}>
      <primitive object={scene} />
    </group>
  )
}

// Its own Suspense, so the file loads without holding up the rest of the scene.
export default function X(props) {
  return (
    <Suspense fallback={null}>
      <XModel {...props} />
    </Suspense>
  )
}
```

- **Sombras.** La sombra de la vela tiene poco sesgo, y una malla de doble cara se raya
  sola (acné), como pasó con el mago y el casco. Si `doubleSided` es `true`, sólo
  `castShadow`. Si es de una cara, `cast` y `receive`, como el escudo o la jarra.
- **Clic o hover sobre un GLB.** Nunca pongas los handlers sobre la malla del modelo:
  R3F la raycastea en cada movimiento del puntero, y el marco del retrato (525 mil
  triángulos) tardaba 158 ms por rayo. Usa un plano invisible encima: un
  `MeshBasicMaterial({ visible: false })`, como `FrameFace` en el retrato o la silueta
  del corazón.

### 6. Colocarlo

Todo va en `src/app/scene/layout.js`.

- **Posición.** Derívala de las constantes de las features (la pared, el mueble, el
  libro), no con coordenadas sueltas, salvo en la mesa, donde manda la medida.
- **Orden de declaración.** Una constante que usa otra va después de ella: el casco
  sobre el aparador se declara tras `CABINET_POSITION`. Si no, el error es "Cannot
  access … before initialization", y el build no lo detecta.
- **Orientación.** Las recetas usadas:
  - mirar al libro: `Math.atan2(BOOK_POSITION[0] - p[0], BOOK_POSITION[2] - p[2])`;
  - mirar a la cámara de reposo: `Math.atan2(SHOTS.rest.position.x - p[0], SHOTS.rest.position.z - p[2])`,
    con `SHOTS` de `@/features/camera`.
- **En la mesa.** Hay que quedarse fuera de lo que se mueve:
  - el libro llega a 39,3 cm a la derecha del lomo durante una visita (en z ±0,2635);
  - el bastón del mago empuja hacia el libro desde el oeste;
  - el corazón da vueltas en torno a (0,2 · 0,2 · −0,53), con 8 cm de radio;
  - la vela está en (0 · −0,45).

  Comprueba que se vea en los planos fijos (referencia §7).
- **Encima de un mueble.** Mide su superficie con rayos hacia abajo (referencia §5):
  dónde es plana, a qué altura y dónde están los adornos. Exporta esa altura medida
  desde el dominio del mueble (`CABINET_TOP_HEIGHT` en el aparador) y centra el objeto
  en el tramo libre.
- **En una pared.** Usa el desplazamiento de la parte trasera, como el escudo y el
  retrato (`*_BACK_OFFSET`, `*_FLOOR_OFFSET`).

### 7. Medir y anotar

Con la escena viva (referencias §6–9), y cada número va al comentario de su constante:
- **Apoyo.** El fondo de la caja contra la superficie; tiene que dar unos 0 mm.
- **Holguras.** Con el barrido del libro y con los vecinos.
- **Cámara.** Barrido de la órbita: la distancia mínima de la lente al objeto y el % de
  vistas en que lo roza. Los tronos y la jarra lo rozan en menos del 1 %, y se anota.
- **Ruta al retrato.** Si el objeto queda cerca (lado este de la mesa, pared norte),
  vuelve a medir la ruta de la cámara (`camera/domain/focus.js`).
- **Coste por frame.** Calls y triángulos con y sin el objeto, sombras incluidas.

### 8. Montar y documentar

- **Montarlo.** Impórtalo y móntalo en `src/app/Scene.jsx` con su posición y su giro.
- **Lista de assets del `CLAUDE.md`.** Añade la feature y la ruta del archivo; el
  párrafo dice que no existe ningún modelo que no esté ahí.
- **Si movías algo.** Busca (`grep`) los comentarios que citaban su sitio viejo:
  `layout.js` describe a cada objeto por sus vecinos ("across from the helmet").
  Corrígelos, o márcalos como históricos ("the helmet (then on the table)").
- **Backlog.** Si venía de él, quita el punto cuando el usuario lo dé por bueno.

### 9. Verificar

1. **Reinicia Vite** si cambiaste o moviste exports; su HMR sirve módulos viejos. Si
   sólo añadiste archivos, basta con recargar.
2. **Prepara el panel** (referencia §1), espera a que acabe la entrada de la cámara y
   lee `window.__errors`. Tiene que estar vacío.
3. **Captura** el plano de reposo y una vista del objeto, y repite la captura si sale
   vieja.
4. **`npm run build`.** Sólo dice que el bundle se escribió; no prueba nada más.

### 10. Informar al usuario

En español y corto:
- **Qué quedó dónde:** sitio, tamaño real y hacia dónde mira, cada cosa con su porqué
  en una línea.
- **Los números medidos:** apoyo, holguras y cámara.
- **Qué mirar y qué gesto probar:** posición, tamaño y orientación son suyos.
- **El peso**, si el modelo es pesado. Ejemplo real: la pluma y la jarra a malla
  completa llevan el frame de 4,2 M a 14,0 M triángulos. Ofrece simplificarlas como el
  sofá (`gltfpack -si <ratio>` sobre los flags de `pack-glb`, medido en PSNR contra la
  malla completa a las distancias de cámara reales), sin hacerlo.
- **Nada de commits** si no los pide. Si los pide, directo a `master`, sin ramas.

## Mover un objeto que ya está

Los pasos 6 a 10 de arriba.
- **El sitio viejo** puede quedar para otro objeto (la jarra ocupó el del casco). Sus
  medidas sirven de partida, pero re-mídelas con la huella nueva.
- **Las medidas antiguas** que dependían del objeto en su sitio anterior, re-mídelas o
  márcalas como históricas.
- **Lo que tenía que ver con su sitio anterior** sale del comentario de su dominio (el
  encuadre del casco en el plano de reposo ya no aplicaba sobre el aparador).
