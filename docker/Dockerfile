# Imagen de producción: build estático servido por nginx.
# Multi-stage para que la imagen final no arrastre node_modules ni el toolchain.

# ---------- Stage 1: build ----------
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund \
    && node node_modules/esbuild/install.js

COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# La imagen unprivileged corre como UID 101 y escucha en 8080, compatible con
# los SCC restringidos de OpenShift (no requiere root ni puertos < 1024).
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
