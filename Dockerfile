# The site as one image: the scene built by Vite, served by server/server.js
# with its /api/love and /api/treats. The SQLite file is not in it — it lives
# in a volume mounted at /data (see deploy/compose.yaml), so replacing the
# container on each deploy leaves the hearts and treats where they were.

# Build: the whole toolchain, thrown away afterwards.
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Run: server/ has no dependencies (node:sqlite is built in, Node ≥ 22.13),
# so it's dist/, server/ and package.json, for its "type": "module".
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    LOVE_DB=/data/love.db
COPY package.json ./
COPY server ./server
COPY --from=build /app/dist ./dist
# Made here, owned by node: a named volume mounted on it for the first time
# is filled from the image, ownership included, so the server can write it.
RUN mkdir -p /data /backups && chown node:node /data /backups
USER node
EXPOSE 3000
CMD ["node", "--disable-warning=ExperimentalWarning", "server/server.js"]
