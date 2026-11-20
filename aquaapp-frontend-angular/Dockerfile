# Etapa 1: compilar la SPA con Angular CLI
FROM node:24.22.3-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --base-href /aquaapp/

# Etapa 2: nginx sirve los estaticos bajo /aquaapp/ y hace de proxy de /api y /auth
FROM nginx:1.31.9-alpine
ENV BACKEND_URL=http://backend:8080 \
    AUTH_URL=http://auth:9000
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/aquaapp-frontend-angular/browser /usr/share/nginx/html/aquaapp
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/aquaapp/ || exit 1
