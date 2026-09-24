# Estructura

Tres capas, y una regla por capa.

```
app/        Monta el canvas y compone la escena. No sabe cómo funciona nada.
features/   Una carpeta por objeto de la escena. Todo lo suyo vive dentro.
shared/     Primitivas sin dominio: no saben qué es un libro ni una vela.
```

## Anatomía de una feature

```
features/book/
  Book.jsx        El componente: ensambla y expone los gestos del visitante.
  index.js        Su superficie pública. Lo demás es privado de la feature.
  domain/         Las reglas. Funciones puras, sin React ni three.js.
  geometry/       Cómo se construyen sus mallas.
  hooks/          Cómo se mueve en el tiempo (useFrame, estado, memos).
  components/     Sus piezas: Cover, Spine, PageLeaf, PageBlock.
  textures/       Sus materiales pintados a canvas.
  shaders/        Su GLSL, si lo tiene.
```

El reparto entre `domain/` y el resto es el que importa:

- `domain/opening.js` dice **dónde** acaba una tapa (`backCoverAngle`), no cómo
  llega. Son funciones del estado de lectura, y se leen solas.
- `domain/flipMotion.js` dice **cómo** llega: duraciones, easings, la flexión.
- `hooks/` ejecuta eso frame a frame. `components/` sólo lo monta en el árbol.

Si un número tiene una razón física ("las tapas vuelan sobre el bloque de
páginas"), es dominio. Si es un detalle de three.js, no lo es.

## Geometría

No hay un `geometry.js` genérico: cada malla dice de qué es geometría.
`shared/three/` guarda lo que no conoce el dominio (`wornRect`, `extrudeFlat`,
`latheFromProfile`); `features/*/geometry/` las configura con las medidas de
su propio objeto (`coverGeometry`, `spineGeometry`, `pageGeometry`).

## Importar

`@` es `src/`. Una feature se importa por lo que es y siempre por su barrel:

```js
import { PageCurlBook } from '@/features/pageCurlBook'
```

Dentro de una feature, rutas relativas. Entre features, sólo lo que el
`index.js` de la otra exporta — hoy: la altura y la huella del libro cerrado
que encuadra la cámara, la altura de la llama que usa el
layout, y el cuero de tapa de `features/book`, con el que el libro de la
escena se encuaderna.

`features/book` es el libro de deformación por vértices con el que arrancó la
escena. Ya no se monta — el libro de la escena es `features/pageCurlBook` —
pero sigue en el repo y sus texturas de tapa siguen en uso.
