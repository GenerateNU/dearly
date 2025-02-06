# Lockdown the bun version dearly uses.
FROM oven/bun:1.2.2 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY backend/package.json backend/bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY backend/package.json backend/bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease 
COPY --from=install /temp/dev/node_modules backend/node_modules
COPY openapi.yaml .
COPY backend ./backend

FROM base AS release 
COPY --from=install /temp/prod/node_modules backend/node_modules
COPY --from=prerelease /usr/src/app/ .

USER bun 
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "backend/src/server.ts" ]
