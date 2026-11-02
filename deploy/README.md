# Deploy en Cloudflare Workers

El sitio son dos cosas, y Cloudflare sirve cada una a su manera:

- **La escena** (`dist/client`, lo que arma Vite: páginas, JS, modelos, texturas) va como
  *static assets*. Cloudflare la sirve desde su red, sin correr el Worker y sin cobrar.
- **Los contadores** (`/api/love` y `/api/treats`) son el Worker, `worker/index.js`, sobre
  una base D1 (SQLite) que se llama `cv-libro-antiguo`. Un deploy reemplaza el Worker y no
  toca la base.

`wrangler.jsonc` une las dos cosas, y `.github/workflows/deploy.yml` despliega en cada push
a `master`.

## Una vez

1. **Cuenta de Cloudflare**, el plan gratis basta.
2. **La base.** En tu computador, dentro del repo:

   ```bash
   npx wrangler login
   npx wrangler d1 create cv-libro-antiguo
   ```

   El segundo comando imprime un `database_id`. Ponlo en `wrangler.jsonc`, en lugar de
   los ceros, y haz commit: no es un secreto. Las tablas las crea el Worker en la
   primera visita.
3. **Primer deploy, a mano:** `npm run deploy`. Al terminar, imprime la dirección
   `https://cv-libro-antiguo.<tu-subdominio>.workers.dev`, y el sitio ya está ahí,
   contadores incluidos.
4. **El dominio de Hostinger.** En Cloudflare: *Add a domain*, plan Free. Cloudflare te
   da dos *nameservers*; en Hostinger (Dominios → tu dominio → DNS / Nameservers)
   reemplaza los de Hostinger por esos dos. Cuando Cloudflare lo marque como activo
   (minutos a unas horas): Workers & Pages → `cv-libro-antiguo` → Settings → Domains &
   Routes → *Add* → *Custom domain* → `tudominio.cl` (y otro para `www.tudominio.cl`,
   si se quiere). El certificado lo pone Cloudflare.
5. **GitHub Actions.** En Cloudflare, My Profile → API Tokens → *Create Token* →
   plantilla **Edit Cloudflare Workers**, más el permiso *Account → D1 → Edit*. Y el
   *Account ID*, que sale en la portada de Workers & Pages. En el repo, Settings →
   Secrets and variables → Actions:
   - *Secrets*: `CLOUDFLARE_API_TOKEN` = el token.
   - *Variables*: `CLOUDFLARE_ACCOUNT_ID` = el Account ID, y `SITE_URL` =
     `https://tudominio.cl` (o la de `workers.dev`). Con ésta, el workflow comprueba al
     final que el sitio responde.

   Sin `CLOUDFLARE_ACCOUNT_ID` el workflow no corre, así que hasta este paso los push no
   hacen nada.

## Día a día

- **Desplegar:** push a `master`, o `npm run deploy` desde tu computador.
- **Ver la cuenta:**
  `npx wrangler d1 execute cv-libro-antiguo --remote --command "select (select count(*) from love) corazones, (select sum(n) from treats) galletas"`
- **Logs en vivo del Worker:** `npx wrangler tail`
- **Respaldo:** D1 guarda su historial solo (*Time Travel*) y se puede volver a
  cualquier momento reciente con `npx wrangler d1 time-travel restore cv-libro-antiguo
  --timestamp=…`. Para una copia propia:
  `npx wrangler d1 export cv-libro-antiguo --remote --output love-backup.sql`
- **Volver a una versión anterior del sitio:** Workers & Pages → `cv-libro-antiguo` →
  Deployments → *Rollback*, o `npx wrangler rollback`.

## En local

`npm run dev` corre el Worker dentro de Vite, con el runtime de Cloudflare y una D1
local en `.wrangler/state/`, ignorada por git. `npm run preview` hace lo mismo con el
build. En local todo es la misma IP: para volver a dar el corazón o pasar del límite de
galletas, borrar `.wrangler/state/`.

## Por qué está armado así

- **El Worker corre sólo para `/api/*`** (`run_worker_first` en `wrangler.jsonc`): los
  91 MB de modelos y texturas no lo despiertan, así que no cuentan para el límite de
  peticiones del plan gratis.
- **La IP es `CF-Connecting-IP`**, que pone Cloudflare y que pisa la que mande el
  cliente. En local no hay Cloudflare delante, así que ahí sí se puede falsear.
- **El día de las galletas es el de Chile** (`America/Santiago`, en `worker/treats.js`):
  un Worker corre en UTC, y con UTC el día cambiaría a las 21:00.
- **Las tablas las crea el Worker** (`worker/store.js`) y no las migraciones de wrangler:
  un paso menos en el primer deploy y en `npm run dev`. Si alguna vez cambia el esquema,
  la migración va ahí mismo, y **nunca se renombra una tabla sin traspasar sus filas**.
- **Encabezados de seguridad:** `public/_headers` para los archivos estáticos y
  `worker/index.js` para la API. Son los mismos: que nadie enmarque la página para robar
  clics al corazón o a la galleta, `nosniff` y `Referrer-Policy`.
