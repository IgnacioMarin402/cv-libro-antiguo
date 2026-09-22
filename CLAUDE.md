# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## El proyecto

Escena 3D de un libro antiguo sobre una mesa, a la luz de una vela. React Three Fiber
sobre three.js, con Vite.

**Todo es procedural.** No se usarán assets (modelos GLTF, imágenes) a menos que se
soliciten: cada malla se construye en código y cada textura se pinta en un canvas 2D.
Los únicos assets del repo son `public/audio/fire-ambience.mp3`, los del mago gato
de `features/wizard`, pedidos expresamente: `public/models/wizard-cat.glb` y su sonido
`public/audio/appear-magic.mp3`, y el casco de `features/helmet`, también pedido:
`public/models/fantasy-helmet.glb`. Antes de buscar otro archivo de modelo o de textura,
asume que no existe y que hay que generarlo.

Hay **dos implementaciones de libro**. La que se monta es `src/features/pageCurlBook/`:
hojas con esqueleto de huesos, tomada del tutorial wass08/r3f-animated-book-slider.
`src/features/book/` es la original, de deformación por vértices; ya no entra en la
escena, pero su cuero de tapa es con el que se encuaderna la que sí.

Cuidado al copiar de esa referencia: el libro del tutorial flota vertical en el aire y
éste está apoyado en una mesa. Casi todos los fallos de esta escena han salido de dar
por buena una mecánica suya sin volver a derivar lo que dependía de que aquí hay un
suelo — la curva de la hoja cae por debajo de la bisagra, el apilado apunta donde no
debe, el abanico hunde una de las dos pilas.

`legacy-canvas-artifact/` es el prototipo original en un solo archivo, guardado como
referencia. No entra en el build.

## Comandos

```bash
npm run dev             # Vite en $PORT (.env) o 5173
npm run build
npm run preview
node scripts/probe.mjs  # mide el libro sin navegador (ver Medir antes de tocar)
```

No hay tests, linter ni type-checking, y **`npm run build` no vale como verificación**
(ver Verificación, abajo).

`.env` (copiar de `.env.example`): `PORT`. `VITE_MAX_PAGES` sólo alimenta
`features/book`, que ya no se monta — hoy no hace nada. La palanca de hojas es
`PAGE_COUNT` en `pageCurlBook/domain/pageCurl.js`.

## Arquitectura

Tres capas, y una regla por capa:

```
src/app/        Monta el canvas y compone la escena. No sabe cómo funciona nada.
src/features/   Una carpeta por objeto de la escena. Todo lo suyo vive dentro.
src/shared/     Primitivas sin dominio: no saben qué es un libro ni una vela.
```

`src/README.md` tiene la convención completa y es la referencia canónica. Lo esencial:

Cada feature se ordena igual — `Book.jsx` + `index.js` + `domain/` + `geometry/` +
`hooks/` + `components/` + `textures/` + `shaders/`. El corte que importa es
`domain/`:

- **`domain/` son las reglas**: funciones puras y constantes, sin React ni three.js.
  Medidas físicas del objeto, y dónde acaba cada pieza según el estado.
  `backCoverAngle(open, pagesTurned, total)` dice que la contratapa sube a medida que
  se le quita peso encima; no sabe nada de frames.
- **`geometry/` es cómo se construye**, configurando las primitivas de `shared/three`
  con las medidas del dominio.
- **`hooks/` es cómo se mueve**: `useFrame`, refs, memos.
- **el componente sólo lo monta** en el árbol de three.

Criterio: si un número tiene una razón física ("las tapas vuelan sobre el bloque de
páginas"), es dominio. Si es un detalle de three.js, no lo es.

`src/features/book/` es la feature más completa y el modelo a seguir para la
estructura, aunque ya no se monte. `src/features/pageCurlBook/` es la que está viva, y
la que más medida está: sus constantes de holgura y apilado son números medidos, no
elegidos (ver Medir antes de tocar).

### Añadir un objeto a la escena

En este orden:

1. `src/features/<objeto>/domain/` — primero las medidas y las reglas como funciones puras.
2. `geometry/` — construir las mallas con esas medidas, reutilizando `shared/three/`.
3. `textures/`, `shaders/` si hace falta.
4. `hooks/` — lo que corre por frame o guarda estado.
5. El componente, y un `index.js` que exponga sólo lo público.
6. Su posición en `src/app/scene/layout.js`, y montarlo en `src/app/Scene.jsx`.

No empieces por el JSX y extraigas después: el dominio primero es el punto del refactor
que estableció esta estructura.

## Convenciones 3D

- **Unidades en metros.** Superficie de la mesa en `y = 0`, libro en el origen. Las
  bisagras (tapas, hojas, lomo) giran en Z.
- **Elegir la técnica de malla:**
  - Silueta revuelta en torno → perfil `[radio, altura]` + `latheFromProfile`
    (candelabro). El perfil es dato en `domain/`.
  - Panel plano con grosor → `wornRect` (rectángulo de bordes irregulares) + `extrudeFlat`.
  - Malla que se deforma → `BufferGeometry` a mano (las hojas: grid compartido, dos
    capas y faldón perimetral; ver `book/geometry/pageSheet.js`).
  - Texturas → canvas 2D + `canvasTexture`. Cuidado con `colorSpace`: sRGB para color,
    `NoColorSpace` para bump/height.
- **Patrón de bisagra:** un `<group>` colocado en el eje de giro, con la malla
  desplazada dentro. Nunca rotar la malla sobre su propio centro.
- **Rotaciones anidadas:** si un grupo cuelga de otro que también rota (tapas y hojas
  dentro del lomo), hay que restar el ángulo del padre — `parentAngleRef` en
  `useHingeRotation` y `usePageFlip`. Si no, los ángulos se suman y sobre-rotan.
- **Animar por frame, no por estado.** `useFrame` + `useRef`. React state sólo para lo
  que cambia la composición (abierto/cerrado, páginas pasadas). Un valor que otro
  objeto necesita leer cada frame se comparte por ref (`useBookHinges`), nunca por
  props ni state.
- **Geometría compartida, clon privado.** Las hojas comparten una geometría y sólo
  clonan mientras se doblan, volviendo a la compartida al terminar.
- **Memoizar geometrías y materiales** (`useMemo`, deps vacías en los hooks `useBook*`).
  Crear un `MeshStandardMaterial` en cada render es una fuga de GPU.
- **Grupos de material:** `extrudeFlat({ splitCaps: true })` parte un panel en tres
  grupos (interior / canto / exterior) para darle material distinto a cada cara.
- **Iluminación y render** se tocan en `app/scene/renderer.js` (tone mapping, fog,
  environment) y `features/lighting/domain/lightingRig.js`, no en los materiales.
- **Palancas de rendimiento:** `PAGE_COUNT` (cada hoja del libro es una cadena de 31
  huesos), `MOTE_COUNT`, `DUST_COUNT`, el `shadow-mapSize` de la vela, el `dpr` del
  canvas.

## Estilo

- Comentarios de código en inglés; documentación de repo en español.
- Los comentarios explican **por qué** un número es ese, no qué hace la línea. Son la
  memoria del proyecto: al cambiar una constante afinada, actualizar su comentario.
- JS/JSX sin punto y coma, comillas simples, 2 espacios (el GLSL, aparte).
- Entre features se importa sólo por el barrel (`@/features/book`); dentro de una
  feature, rutas relativas. `@` es `src/`.

## Medir antes de tocar

Ante cualquier duda geométrica o de animación, no estimes: reconstruye el objeto en
Node y mídelo. `domain/` es puro precisamente para esto — las mismas funciones que usa
la escena corren sin navegador. `scripts/probe.mjs` ya monta el libro entero y lo mide;
`node scripts/probe.mjs` comprueba de una vez las tres cosas que sus constantes tienen
que cumplir (que dos hojas vecinas no se atraviesen, que nada toque la mesa ni en
reposo ni a mitad de giro, que el libro cerrado apoye). Para otro objeto, el patrón es
el mismo: misma jerarquía de `Object3D`, posada con las funciones del dominio, avanzada
a 60 fps con el mismo amortiguado, y leída con `getWorldPosition`.

Tres casos de esta escena donde el ojo y la pose estática se equivocaron:

- La hoja abierta cuelga 5,35 cm bajo su bisagra. La pose teórica decía 16: el
  amortiguado nunca llega al objetivo instantáneo. Medir sin la dinámica levanta el
  libro tres veces de más.
- Dos hojas vecinas se atravesaban 3 mm. En vertical la medida parecía correcta —
  cerca del lomo las hojas están casi verticales y ahí esa medida no dice nada. La
  distancia real 3D entre las dos polilíneas dio 0,0 mm y señaló la causa.
- La dirección de apilado (27,5° de la vertical) salió de barrer todas las direcciones
  contra la cadena de huesos, no de probar dos y quedarse con la mejor.

Deja el número medido en el comentario de su constante, y si tocas el grosor de hoja,
la curva, el tamaño de página o el apilado, **vuelve a medir**: la caída escala con el
ancho de página y la separación entre hojas no.

## Verificación

Tres pasos, y ninguno sustituye al siguiente.

1. **`npm run build` no prueba nada.** Empaqueta sin analizar ámbitos: en esta escena
   ha pasado verde con `ReferenceError: boards is not defined` y con una zona muerta
   temporal (`Cannot access 'TABLE_CLEARANCE_Y' before initialization`). Un build
   limpio sólo dice que el bundle se escribió.
2. **Abrir la escena y leer la consola.** Ahí salen esos dos y cualquier `undefined` de
   three. Si acabas de renombrar o mover un export, **reinicia Vite antes de mirar**:
   su HMR se queda atascado en el error anterior y sigue sirviendo módulos viejos —
   estarías verificando código que ya no existe.
3. **Pedirle al usuario que lo mire**, describiendo qué debería verse y qué gesto
   probar, sin afirmar que funciona.

El reparto entre 2 y 3: el navegador es para **hechos** (¿carga?, ¿existe la malla?,
¿responde el clic?, ¿atraviesa la mesa?), el usuario es para el **gusto**. Comprobar un
hecho no es juzgar la escena.

Un detalle práctico: un clic sintético sobre el canvas necesita stubear
`setPointerCapture` y despachar pointermove → pointerdown → pointerup → click. Los
clics normales del navegador los interpreta OrbitControls como arrastre y no llegan al
raycast, así que no sirven para abrir el libro desde una prueba.

> **Pendiente de anotar bien (no rompe nada hoy, pero cuesta tres intentos):** esa
> receta está incompleta. R3F calcula la posición del puntero con `offsetX`/`offsetY`,
> que el constructor de `PointerEvent`/`MouseEvent` no acepta y quedan en 0 — así que
> el clic aterriza siempre en la esquina superior izquierda y no pega en nada. Hay que
> definirlos a mano sobre cada evento antes de despacharlo:
> `Object.defineProperty(e, 'offsetX', { get: () => ox })`, con `ox`/`oy` relativos al
> canvas. Y el `click` final es un `MouseEvent` aparte: sin él `onClick` no dispara,
> porque los `pointer*` solos no abren el libro.
