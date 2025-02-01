FROM oven/bun:1 AS base
WORKDIR /backend

FROM base AS install
RUN mkdir -p /temp/dev/
COPY package.json bun.lock /temp/dev/
