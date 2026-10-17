# Build public client assets. Never pass server secrets through VITE_* variables.
FROM node:24-alpine AS build
WORKDIR /app
RUN npm install --global pnpm@12.5.1
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY vendor ./vendor
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build:testing

# The running image has no framework SSR server and no application dependencies.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080 PUBLIC_DIR=/app/public
COPY --from=build /app/.output/public ./public
COPY scripts/serve-static.mjs ./serve-static.mjs
USER node
EXPOSE 8080
CMD ["node", "serve-static.mjs"]
