# --- build: compila la SPA con Vite ---
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- runtime: nginx sirve /aquaapp/ y hace de proxy de /api y /auth ---
FROM nginx:alpine
# El entrypoint de la imagen aplica envsubst a /etc/nginx/templates/*.template
ENV BACKEND_URL=http://backend:8080 \
    AUTH_URL=http://auth:9000
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/ /usr/share/nginx/html/aquaapp/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/aquaapp/ || exit 1
