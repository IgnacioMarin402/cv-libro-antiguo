# Deploy en un VPS (Hostinger KVM)

Un contenedor con la app (la imagen del `Dockerfile` de la raíz) y Caddy delante para
el HTTPS. La base (`love.db`, corazones y galletas) vive en el volumen `libro-data`:
cada deploy reemplaza el contenedor y el volumen queda. GitHub Actions
(`.github/workflows/deploy.yml`) construye la imagen en cada push a `master`, la sube
a `ghcr.io` y la cambia en el VPS.

```
/opt/libro/
  .env            DOMAIN=…  e IMAGE=… (éste lo escribe el workflow)
  compose.yaml    copiado por el workflow en cada deploy
  caddy/Caddyfile copiado por el workflow en cada deploy
  backup.sh       copiado por el workflow; lo corre cron a las 4:17
  backups/        un love-AAAA-MM-DD.db por día, 30 días
```

## Una vez

1. **El VPS.** Hostinger → VPS, plan KVM 1 (alcanza), con **Ubuntu 24.04** pelado.
   Anotar la IP.
2. **El dominio.** En el DNS, un registro `A` de `tudominio.cl` a la IP del VPS (y
   `AAAA` si el VPS tiene IPv6). Y lo mismo para `www`, si se quiere: el Caddyfile
   lo redirige al dominio sin `www`. Sin ese registro, Caddy reintenta el
   certificado de `www` en el log, pero el resto anda.
3. **Preparar la máquina.** Desde el repo, en tu computador:

   ```bash
   scp -r deploy root@IP:/root/
   ssh root@IP 'DOMAIN=tudominio.cl sh /root/deploy/setup-vps.sh'
   ```

   Instala Docker, abre los puertos 22, 80 y 443, crea el usuario `deploy` (con el
   que entra GitHub), `/opt/libro` y el respaldo diario.
4. **La llave de GitHub Actions.** En tu computador:

   ```bash
   ssh-keygen -t ed25519 -N '' -C github-deploy -f libro-deploy
   ssh root@IP "cat >> /home/deploy/.ssh/authorized_keys" < libro-deploy.pub
   ssh-keyscan IP > libro-known-hosts
   ```

5. **GitHub.** En el repo, Settings → Secrets and variables → Actions:
   - *Secrets*: `VPS_SSH_KEY` = el contenido de `libro-deploy` (la privada) y
     `VPS_KNOWN_HOSTS` = el de `libro-known-hosts`.
   - *Variables*: `VPS_HOST` = la IP. Sin esta variable el workflow no corre, así que
     hasta este paso los push no hacen nada.

   Luego, borrar `libro-deploy` del computador: ya vive en GitHub.
6. **El primer deploy.** Actions → deploy → Run workflow (o un push a `master`). Al
   terminar, `https://tudominio.cl` responde; el primer certificado tarda unos
   segundos.

## Día a día

- **Desplegar:** push a `master`. El paso final llama a `/api/love` y falla si la app
  no responde.
- **Ver la cuenta:**
  `ssh deploy@IP 'cd /opt/libro && docker compose exec -T app node -e "const d=new (require(\"node:sqlite\").DatabaseSync)(process.env.LOVE_DB);console.log(d.prepare(\"select (select count(*) from love) corazones, (select sum(n) from treats) galletas\").get())"'`
- **Logs:** `ssh deploy@IP 'cd /opt/libro && docker compose logs -f app'`
- **Volver a una versión anterior:** en `/opt/libro/.env`, poner en `IMAGE=` el commit
  anterior (`ghcr.io/ignaciomarin402/cv-libro-antiguo:<sha>`) y `docker compose up -d`.
- **Restaurar un respaldo:** con la app parada (`docker compose stop app`), copiarlo al
  volumen y volver a levantarla:
  `docker compose run --rm app cp /backups/love-AAAA-MM-DD.db /data/love.db && docker compose start app`
- **Nunca** `docker compose down -v`: la `-v` borra los volúmenes, y con ellos la base.

## Por qué está armado así

- **Un contenedor, no dos.** SQLite no es un servidor: es un archivo que abre el mismo
  proceso de Node. Lo que tiene que sobrevivir al deploy es el archivo, y para eso
  está el volumen.
- **Caddy en la red del host** (`network_mode: host`): publicado por Docker, todo el
  IPv6 le llegaría desde la IP del puente, y todos esos visitantes contarían como uno.
- **La app sólo en `127.0.0.1:3000`** del host: nadie puede saltarse Caddy y escribir su
  propio `X-Forwarded-For` (`TRUST_PROXY=1`, ver `server/love.js`). Probado: un
  `X-Forwarded-For` falso a través de Caddy sigue contando como el mismo visitante.
- **`TZ=America/Santiago`**: el límite de 3 galletas al día va por el día del servidor,
  y un contenedor está en UTC.
- **El Caddyfile se monta como carpeta**: `scp` reemplaza el archivo, y montado suelto
  el contenedor seguiría viendo el viejo.
