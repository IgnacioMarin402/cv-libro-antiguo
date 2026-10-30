#!/bin/sh
# A copy of love.db a day, kept 30 days, in /opt/libro/backups. Run by cron
# (see setup-vps.sh). VACUUM INTO writes a consistent copy while the server
# keeps running — copying the file itself could catch it mid-write.
set -eu
cd /opt/libro

day=$(date +%F)
rm -f "backups/love-$day.db"
docker compose exec -T app node --disable-warning=ExperimentalWarning -e "
  const { DatabaseSync } = require('node:sqlite')
  new DatabaseSync(process.env.LOVE_DB).exec(\"VACUUM INTO '/backups/love-$day.db'\")
"
find backups -name 'love-*.db' -mtime +30 -delete
