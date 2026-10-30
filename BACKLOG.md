# Backlog

Lo que queda por hacer, anotado el 2026-10-03 y actualizado el 2026-10-30. Sólo qué, no cómo.

Nada pendiente.

## Shipped

- 1. Retrato de los perros: zoom al hacer clic, nombres «mágicos» (Cinzel Decorative) y botón para volver.
- 2. Corazón: se agranda y brilla al pasar el mouse, con un aviso sobre el like.
- 3. Contador de likes: crece al pasar el mouse y dice «Likes totales».
- 5. GLB que faltaban: la pluma con su tintero y la jarra del dragón, en la mesa; el casco, encima del aparador.
- 8. Botón de regreso: componente compartido (`shared/ui/BackButton`) con el brillo de la lupa y el CV.
- 6. Busto de Shourdo: zoom al hacer clic, botón «Dar una galleta» que la lanza a su boca (abre y cierra la mandíbula, dos corazones), contador de galletas en lugar del de likes, 3 al día por IP (`/api/treats`) y aviso de que Gordo se siente satisfecho.
- 4. Verificación de seguridad (2026-10-30): dependencias de producción sin vulnerabilidades; Vite subido a 8.3.5 (avisos de su middleware y de `server.fs`); el servidor manda cabeceras contra framing (`frame-ancestors 'none'`, `X-Frame-Options`), `nosniff` y `Referrer-Policy`; probados path traversal (`..`, `%2e%2e`, `..\` codificado, `%00`), CSRF en las dos API y el límite de galletas en paralelo. Queda `sharp` (sólo scripts locales de GLB): su arreglo es un salto de versión mayor.
- 7. Jarra del dragón: zoom al hacer clic, vibra y se llena de cerveza con espuma la primera vez de cada carga de la página; se queda llena hasta recargar.
