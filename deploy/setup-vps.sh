#!/bin/sh
# Once, on a fresh Ubuntu VPS, as root:
#
#   DOMAIN=example.com sh setup-vps.sh
#
# Installs Docker, opens SSH and the web ports, makes /opt/libro with its
# .env and backups, a deploy user for GitHub Actions, and the daily backup.
# Run again, it changes nothing that's already in place.
set -eu
: "${DOMAIN:?DOMAIN=example.com sh setup-vps.sh}"

command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh

if command -v ufw >/dev/null; then
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw allow 443/tcp
  # HTTP/3
  ufw allow 443/udp
  ufw --force enable
fi

# The user the workflow logs in as: in the docker group to replace the
# container, and nothing else.
id deploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash deploy
usermod -aG docker deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys

install -d -o deploy -g deploy /opt/libro
install -d -o deploy -g deploy /opt/libro/caddy
# Written by the app container, which runs as node (uid 1000); old copies
# deleted by backup.sh, which cron runs as deploy.
install -d -m 775 -o 1000 -g deploy /opt/libro/backups
[ -f /opt/libro/.env ] || printf 'DOMAIN=%s\n' "$DOMAIN" > /opt/libro/.env
chown deploy:deploy /opt/libro/.env

cp "$(dirname "$0")/backup.sh" /opt/libro/backup.sh
cp "$(dirname "$0")/Caddyfile" /opt/libro/caddy/Caddyfile
cp "$(dirname "$0")/compose.yaml" /opt/libro/compose.yaml
chown deploy:deploy /opt/libro/caddy/Caddyfile /opt/libro/compose.yaml /opt/libro/backup.sh
chmod 755 /opt/libro/backup.sh
echo '17 4 * * * deploy /opt/libro/backup.sh' > /etc/cron.d/libro-backup

echo
echo "Listo. Falta la llave de GitHub Actions en /home/deploy/.ssh/authorized_keys"
echo "(ver deploy/README.md) y que $DOMAIN apunte a esta máquina."
