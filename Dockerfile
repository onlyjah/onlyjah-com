# Static client artifact only. The runtime contains Caddy, not Node or SSR.
# Pin verified image digests before production promotion.
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_ARK_PUBLIC_API_URL
ENV VITE_ARK_PUBLIC_API_URL=${VITE_ARK_PUBLIC_API_URL}
RUN pnpm build:testing

FROM caddy:2-alpine
COPY --from=build /app/.output/public /srv
COPY deploy/constellation.Caddyfile /etc/caddy/Caddyfile
ENV PORT=8080
EXPOSE 8080
