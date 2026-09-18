# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## El proyecto

Escena 3D de un libro antiguo sobre una mesa, a la luz de una vela. React Three Fiber
sobre three.js, con Vite.

**Todo es procedural.** No hay modelos GLTF ni imágenes: cada malla se construye en
código y cada textura se pinta en un canvas 2D. El único asset del repo es
`public/audio/fire-ambience.mp3`. Antes de buscar un archivo de modelo o de textura,
asume que no existe y que hay que generarlo.

`legacy-canvas-artifact/` es el prototipo original en un solo archivo, guardado como
referencia. No entra en el build.

## Comandos

```bash
npm run dev      # Vite en $PORT (.env) o 5173
npm run build
npm run preview
```

No hay tests, linter ni type-checking. La verificación de un cambio es: `npm run build`
limpio, consola del navegador sin errores, y **el usuario mirando la escena** (ver
Verificación, abajo).

`.env` (copiar de `.env.example`): `PORT` y `VITE_MAX_PAGES` (hojas individualmente
pasables del libro; es la palanca de rendimiento principal).

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

`src/features/book/` es el ejemplo completo y el modelo a seguir.

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
    (candelabro, yelmo). El perfil es dato en `domain/`.
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
- **Palancas de rendimiento:** `VITE_MAX_PAGES`, `DUST_COUNT`, el `shadow-mapSize` de
  la vela, el `dpr` del canvas.

## Estilo

- Comentarios de código en inglés; documentación de repo en español.
- Los comentarios explican **por qué** un número es ese, no qué hace la línea. Son la
  memoria del proyecto: al cambiar una constante afinada, actualizar su comentario.
- JS/JSX sin punto y coma, comillas simples, 2 espacios (el GLSL, aparte).
- Entre features se importa sólo por el barrel (`@/features/book`); dentro de una
  feature, rutas relativas. `@` es `src/`.

## Verificación

Claude no puede juzgar si algo "se ve bien". Tras cualquier cambio visual o 3D: build
limpio, consola sin errores, y **pedirle al usuario que lo mire** — describir qué
debería verse y qué gesto probar, sin afirmar que funciona.
