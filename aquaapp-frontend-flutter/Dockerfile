# build: compila Flutter Web (CanvasKit) con la ruta base /aquaapp/
FROM ghcr.io/cirruslabs/flutter:3.44.0 AS build
WORKDIR /app
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get
COPY analysis_options.yaml ./
COPY assets ./assets
COPY web ./web
COPY lib ./lib
RUN flutter build web --release --base-href /aquaapp/

# runtime: nginx sirve los estáticos y hace de proxy de /api y /auth
FROM nginx:alpine
# Destinos del proxy; se pueden cambiar con `docker run -e` / environment del compose.
ENV BACKEND_URL=http://backend:8080 \
    AUTH_URL=http://auth:9000 \
    NGINX_ENVSUBST_FILTER="^(BACKEND_URL|AUTH_URL)$"
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/build/web /usr/share/nginx/html/aquaapp
EXPOSE 80
