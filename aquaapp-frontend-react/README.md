<p align="center">
  <img src="img/aquaapp-logo-horizontal.svg" alt="Logo de aquaapp" width="320"/>
</p>

<p align="center"><i>aquaapp — Gestión de recursos hídricos · Cliente web con React y Material UI</i></p>

<p align="center">
  <img src="img/hero-aquaapp-react.svg" alt="Listado de embalses de aquaapp (React) en escritorio y en móvil" width="900"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-Backend-4e6eac?style=for-the-badge" alt="Stack: backend"/><br/>
  <img src="https://img.shields.io/badge/Java-25-b07219?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 25"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot 4.1"/>
  <img src="https://img.shields.io/badge/Rust-auth%20service-DEA584?style=for-the-badge&logo=rust&logoColor=black" alt="Rust"/>
  <img src="https://img.shields.io/badge/OpenAPI-3-6BA539?style=for-the-badge&logo=openapiinitiative&logoColor=white" alt="OpenAPI 3"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-Frontend-4e6eac?style=for-the-badge" alt="Stack: frontend"/><br/>
  <img src="https://img.shields.io/badge/TypeScript-7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/MUI-9-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="Material UI"/>
  <img src="https://img.shields.io/badge/Material%20Icons-757575?style=for-the-badge&logo=materialdesign&logoColor=white" alt="Material Icons"/>
  <img src="https://img.shields.io/badge/Vitest-Testing%20Library-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest"/>
  <img src="https://img.shields.io/badge/Nginx-static%20%2B%20proxy-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx"/>
  <img src="https://img.shields.io/badge/Docker-multi--stage-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

<p align="center">
  <a href="#capturas-de-pantalla"><img src="https://img.shields.io/badge/-Capturas-4e6eac?style=flat-square"/></a>
  <a href="#mapa-de-navegación"><img src="https://img.shields.io/badge/-Mapa%20de%20Navegación-4e6eac?style=flat-square"/></a>
  <a href="#arquitectura"><img src="https://img.shields.io/badge/-Arquitectura-4e6eac?style=flat-square"/></a>
  <a href="#instalación-y-puesta-en-marcha"><img src="https://img.shields.io/badge/-Instalación-4e6eac?style=flat-square"/></a>
  <a href="#pruebas"><img src="https://img.shields.io/badge/-Pruebas-4e6eac?style=flat-square"/></a>
  <a href="#integración-continua"><img src="https://img.shields.io/badge/-CI-4e6eac?style=flat-square"/></a>
</p>

## Autor

- [Cristian Augusto](https://github.com/augustocristian)

## Índice

- [Descripción del proyecto](#descripción-del-proyecto)
- [Capturas de pantalla](#capturas-de-pantalla)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Mapa de navegación](#mapa-de-navegación)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
- [Pruebas](#pruebas)
- [Integración continua](#integración-continua)
- [Decisiones de implementación](#decisiones-de-implementación)
- [Licencia](#licencia)

## Descripción del proyecto

**aquaapp (React)** es una de las variantes del cliente web de aquaapp, la aplicación de gestión de recursos
hídricos del Principado de Asturias de la práctica de Tecnologías Web. Es una SPA construida con **React 19,
TypeScript y Vite**, con la interfaz en **Material UI (MUI)**, que reproduce la funcionalidad del cliente original
(HTML + TypeScript sin framework, en `aquaapp-cliente` de `tew-profes-lab-spring`) y consume la misma API REST: el
backend Spring Boot (embalses) y el servicio de autenticación en Rust, ambos del repositorio `tew-profes-lab-spring`.

- **Login y registro** en un único diálogo modal; el JWT se guarda en `sessionStorage` (clave `jwt`), el usuario se
  lee del claim `sub` y la caducidad del claim `exp`.
- **CRUD de embalses** contra `/api/embalses` con `Authorization: Bearer`: listado, alta, edición y borrado.
- **Listado** con fecha de actualización formateada con `Intl`, filtro por nombre, paginación de 5 en 5 y panel
  lateral con el número de embalses y el nivel medio.
- **Formulario de alta/edición** incrustado en la página (no es un modal), con validación: el nivel actual no puede
  superar la capacidad.
- **Gestión de errores de sesión y permisos**: un `401` inesperado limpia la sesión y muestra la vista «Sesión no
  válida»; un `403` (usuario `USER`, solo lectura) muestra «No tienes permiso para esta acción».
- **Selector de idioma** (es/en): los textos se cargan en tiempo de ejecución desde `public/i18n/*.json` (los
  mismos ficheros del cliente original) y el idioma se recuerda en `localStorage`.
- **Contenedor Docker** (multi-stage: Node → Nginx) que sirve la SPA bajo `/aquaapp/` y hace de proxy inverso de
  `/api/*` hacia el backend y de `/auth/*` hacia el servicio de autenticación.

Es una de las tres variantes del cliente (Angular, React y Flutter) que viven en el repositorio
`frameworks-examples`.

## Capturas de pantalla

> Capturas en **SVG** (vectorial) generadas con los scripts de la carpeta [`src/`](../src/) del repositorio
> (Chrome → PDF → SVG), con el stack arrancado y en español. Muestran la versión de **escritorio** (izquierda) y la
> de **móvil** (derecha).

<p align="center">
  <img src="img/captura-login-escritorio.svg" alt="Diálogo de inicio de sesión en escritorio" width="560"/>
  &nbsp;
  <img src="img/captura-login-movil.svg" alt="Diálogo de inicio de sesión en móvil" width="162"/>
  <br/>
  <em><b>Figura 1 · Inicio de sesión.</b> Al arrancar sin token se abre el diálogo de login (<code>Dialog</code> de
  MUI), compartido con el registro. Si las credenciales son válidas guarda el JWT y pasa al listado; si no, muestra
  el error en el propio formulario.</em>
</p>

<p align="center">
  <img src="img/captura-listado-filtro-escritorio.svg" alt="Listado de embalses filtrado por nombre en escritorio" width="560"/>
  &nbsp;
  <img src="img/captura-listado-filtro-movil.svg" alt="Listado de embalses filtrado por nombre en móvil" width="162"/>
  <br/>
  <em><b>Figura 2 · Listado con filtro por nombre.</b> Tabla de embalses con filtro, paginación de 5 en 5, botones
  de editar y eliminar (icono con <code>Tooltip</code> y <code>aria-label</code>) y, a la derecha, el panel
  con el número de embalses y el nivel medio. En móvil el panel pasa debajo de la tabla y se oculta la columna Id.</em>
</p>

<p align="center">
  <img src="img/captura-formulario-escritorio.svg" alt="Formulario de alta de embalse en escritorio" width="560"/>
  &nbsp;
  <img src="img/captura-formulario-movil.svg" alt="Formulario de alta de embalse en móvil" width="162"/>
  <br/>
  <em><b>Figura 3 · Alta de embalse.</b> El formulario se incrusta en la página (no es un modal) y sirve también
  para editar. Valida que el nivel actual no supere la capacidad antes de enviar.</em>
</p>

<p align="center">
  <img src="img/captura-sin-permiso-escritorio.svg" alt="Aviso de falta de permiso al guardar con un usuario de solo lectura, en escritorio" width="560"/>
  &nbsp;
  <img src="img/captura-sin-permiso-movil.svg" alt="Aviso de falta de permiso al guardar con un usuario de solo lectura, en móvil" width="162"/>
  <br/>
  <em><b>Figura 4 · Permisos (403).</b> El usuario <code>ana</code> (rol <code>USER</code>, solo lectura) intenta
  guardar un embalse: el backend responde 403 y el cliente muestra un <code>Snackbar</code> con «No tienes permiso
  para esta acción».</em>
</p>

<p align="center">
  <img src="img/captura-sesion-no-valida-escritorio.svg" alt="Vista de sesión no válida en escritorio" width="560"/>
  &nbsp;
  <img src="img/captura-sesion-no-valida-movil.svg" alt="Vista de sesión no válida en móvil" width="162"/>
  <br/>
  <em><b>Figura 5 · Sesión no válida.</b> Si el backend responde 401 a una petición con un token que el cliente
  creía vigente (firma incorrecta, secreto cambiado...), se limpia la sesión y se ofrece volver al login.</em>
</p>

## Estructura del proyecto

```
📁 aquaapp-frontend-react/
├── 📁 src/
│   ├── 📁 api/              # fetch tipado: auth, embalses, token, ErrorApi
│   ├── 📁 components/       # BarraNavegacion, MenuBoton, DialogoAuth, PanelIndicadores
│   ├── 📁 views/            # ListadoView, FormularioView, ErrorAuthView
│   ├── 📁 context/          # Contextos de sesión (JWT) e i18n y sus providers
│   ├── 📁 hooks/            # useEmbalses, useListado, useBodyListo
│   ├── 📁 utils/            # Funciones puras: jwt, i18n (Intl), filtro y paginación
│   ├── 📁 assets/           # Logo de aquaapp
│   ├── 📁 test/             # Utilidades de las pruebas (setup, JWT falso, render con i18n)
│   ├── 📄 App.tsx
│   ├── 📄 main.tsx
│   └── 📄 tema.ts
├── 📁 public/
│   ├── 📁 i18n/             # es.json y en.json (cargados en tiempo de ejecución)
│   └── 📄 favicon.ico
├── 📁 nginx/
│   └── 📄 default.conf.template
├── 📁 img/                  # Logos y capturas (SVG) de este README
├── 📄 index.html
├── 📄 vite.config.ts
├── 📄 tsconfig.json         # (+ tsconfig.app.json y tsconfig.node.json)
├── 📄 .oxlintrc.json
├── 📄 Dockerfile
├── 📄 .dockerignore
└── 📄 package.json
```

- 📁 `api/` — Módulo de acceso a la API: `http.ts` (`apiFetch`, que adjunta el JWT y lanza `ErrorApi` si la respuesta no es 2xx), `embalses.ts` (CRUD), `auth.ts` (login y registro) y `token.ts` (`sessionStorage`)
- 📁 `components/` — Piezas de interfaz reutilizables con MUI: `AppBar` con menús (`Menu`/`MenuItem`), diálogo de login/registro y panel de indicadores
- 📁 `views/` — Las pantallas que se muestran en `<main>`: listado, formulario de alta/edición y «sesión no válida»
- 📁 `context/` — `SesionProvider` (usuario y JWT) e `I18nProvider` (textos, idioma y formato `Intl`), con sus hooks `useSesion` y `useI18n`
- 📁 `hooks/` — `useEmbalses` (datos y operaciones CRUD), `useListado` (filtro y paginación) y `useBodyListo` (atributo `data-listo`)
- 📁 `utils/` — Lógica sin React, fácil de probar: lectura del JWT, idioma inicial y formatos, filtrado y paginación
- 📁 `public/i18n/` — Los `es.json` y `en.json` del cliente original (más dos claves nuevas, ver [Decisiones](#decisiones-de-implementación))
- 📁 `nginx/` — Plantilla de Nginx: estáticos bajo `/aquaapp/` y proxy de `/api/` y `/auth/`
- 📄 `Dockerfile` — Imagen multi-stage: `node` compila con Vite y `nginx:alpine` sirve el resultado
- 📄 `vite.config.ts` — `base: '/aquaapp/'`, proxy de desarrollo (`/api`, `/auth`) y configuración de Vitest

## Mapa de navegación

```mermaid
stateDiagram-v2
    [*] --> Login: sin token (o token caducado)
    [*] --> Listado: con token vigente

    Login --> Registro: Regístrate
    Registro --> Login: cuenta creada / Inicia sesión
    Login --> Login: credenciales inválidas
    Login --> Listado: login correcto

    Listado --> Formulario: Nuevo embalse / editar
    Formulario --> Listado: guardado correcto
    Formulario --> Formulario: nivel > capacidad / 403
    Listado --> Listado: filtrar, paginar, eliminar
    Listado --> Listado: eliminar con 403 (aviso)

    Listado --> SesionNoValida: 401 inesperado
    Formulario --> SesionNoValida: 401 inesperado
    SesionNoValida --> Login: Ir a iniciar sesión

    Listado --> Login: Salir
    Formulario --> Login: Salir
```

Cada estado es una vista (o el diálogo de autenticación) dentro de la misma página: no hay recarga ni *router*.
`Login` y `Registro` son el mismo `Dialog` de MUI con distinto contenido; `Listado`, `Formulario` y `SesionNoValida`
se pintan en `<main>` (el panel de indicadores solo aparece con el listado). Las transiciones de «Nuevo embalse»,
«Listado» y «Salir» salen de los menús de la barra superior.

## Arquitectura

La SPA se compila a ficheros estáticos y los sirve Nginx, que además actúa de proxy inverso: `/api/*` va al
backend Spring Boot y `/auth/*` al servicio de autenticación (quitando el prefijo `/auth`). Así el navegador solo
habla con un origen y no hay problemas de CORS. Nginx se une a la red de Docker del stack de `tew-profes-lab-spring`
(`aquaapp-network`) para resolver los servicios `backend` y `auth` por nombre.

```mermaid
flowchart LR
    subgraph NAV["🧑 Navegador"]
        APP["aquaapp-frontend-react<br/>React + MUI (SPA)"]
    end

    subgraph NGINX["Nginx (contenedor aquaapp-frontend-react, puerto 8082 → 80)"]
        STATIC["/aquaapp/ → estáticos de Vite<br/>(fallback a index.html)"]
        PROXYAPI["/api/ → proxy"]
        PROXYAUTH["/auth/ → proxy<br/>(/auth/login → /login)"]
    end

    subgraph RED["Red Docker compartida: aquaapp-network (tew-profes-lab-spring)"]
        BACKEND["backend (Spring Boot)<br/>:8080"]
        AUTH["auth (Rust)<br/>:9000"]
    end

    APP -- "GET /aquaapp/" --> STATIC
    APP -- "fetch('/api/embalses')<br/>Authorization: Bearer" --> PROXYAPI
    PROXYAPI -- "BACKEND_URL" --> BACKEND
    APP -- "POST /auth/login · /auth/register" --> PROXYAUTH
    PROXYAUTH -- "AUTH_URL" --> AUTH
    AUTH -- "JWT" --> APP
```

## Requisitos previos

| Herramienta | Versión | Necesaria para |
|---|---|---|
| Node.js | 24 (la versión con la que se ha probado) | `npm run dev`, build, lint y pruebas |
| Docker | 24+ | Construir y ejecutar la imagen (Nginx) |
| Stack de `tew-profes-lab-spring` | — | La SPA necesita `auth` y `backend` arrancados (`docker compose up -d --build` en ese repositorio), que crea la red `aquaapp-network` |

### Variables de entorno

| Variable | Usada por | Valor por defecto | Descripción |
|---|---|---|---|
| `BACKEND_URL` | Nginx (contenedor) y `vite.config.ts` (`npm run dev`) | `http://backend:8080` (contenedor) · `http://localhost:8080` (dev) | URL del backend al que se reenvía `/api/*` |
| `AUTH_URL` | Nginx (contenedor) y `vite.config.ts` (`npm run dev`) | `http://auth:9000` (contenedor) · `http://localhost:9000` (dev) | URL del servicio de autenticación al que se reenvía `/auth/*` |

En el contenedor, Nginx sustituye `BACKEND_URL` y `AUTH_URL` en la plantilla `nginx/default.conf.template` al
arrancar (`envsubst`). En desarrollo, el proxy de Vite las lee del entorno o de un fichero `.env.local`
(p. ej. `BACKEND_URL=http://localhost:18080 npm run dev` si el 8080 de tu máquina está ocupado).

## Instalación y puesta en marcha

Arranca primero el stack de `tew-profes-lab-spring` (servicios `auth` y `backend`), que crea la red
`aquaapp-network`; después, la SPA con una de estas dos opciones.

**Desarrollo** (Vite con recarga en caliente y proxy hacia `localhost`):

```bash
cd aquaapp-frontend-react
npm install
npm run dev            # http://localhost:5173/aquaapp/
```

**Despliegue con Docker** (Nginx en la red del stack):

```bash
# Desde la raíz del repositorio
docker build -t aquaapp-frontend-react aquaapp-frontend-react
docker run -d --name aquaapp-react \
  --network aquaapp-network -p 8082:80 aquaapp-frontend-react
```

También se puede levantar con el [`docker-compose.yml`](../docker-compose.yml) de la raíz del repositorio, que
declara `aquaapp-network` como red externa y publica la variante React en el puerto 8082 (variable `REACT_PORT`):
`docker compose up -d --build react`.

La aplicación queda disponible en **http://localhost:8082/aquaapp/** (`/` redirige ahí). Usuarios semilla del
servicio de autenticación:

| Usuario | Contraseña | Rol | Permisos |
|---|---|---|---|
| `ana` | `1234` | `USER` | Solo lectura (las escrituras devuelven 403) |
| `admin` | `admin` | `ADMIN` | Lectura y escritura |

Nginx arranca aunque `backend` o `auth` no existan todavía (resuelve sus nombres en cada petición): hasta que
aparezcan, `/api/` y `/auth/` responden `502`.

## Pruebas

```bash
npm run lint     # oxlint (reglas de React y TypeScript)
npm test         # Vitest + Testing Library (22 pruebas)
npm run build    # tsc -b (TypeScript estricto) + vite build
```

Las **pruebas unitarias** (Vitest, entorno `jsdom`) cubren lo que tiene lógica propia:

- `utils/jwt` — lectura del usuario (`sub`) y de la caducidad (`exp`) del token, incluidos tokens mal formados.
- `utils/i18n` — idioma inicial (guardado o del navegador), traducción con clave ausente y formatos `Intl`.
- `utils/listado` y `hooks/useListado` — filtro por nombre, paginación de 5 en 5, página fuera de rango y nivel medio.
- `api/embalses` — método, ruta y cabecera `Authorization: Bearer` de cada operación (con `fetch` simulado), propagación del 403 y token caducado tratado como 401 sin llamar al servidor.
- `views/FormularioView` — validación «nivel ≤ capacidad» y envío con `id: null` (alta) o con el `id` (edición).

Además, el flujo completo (login, listado, alta, edición, borrado, cambio de idioma, 403 con `ana`, registro,
401 y token caducado) se ha verificado en un Chrome real con Playwright contra el contenedor y el stack Spring.

Las **pruebas de sistema** del cliente original (`aquaapp-webtest`, Selenium + Cucumber) son independientes del
framework: solo necesitan una URL base. Esta variante conserva los identificadores que usan (`usuario`,
`password`, `btnLogin`, `menuEmbalses`, `btnAlta`, `nombre`, `capacidadHm3`, `nivelActualHm3`, `btnGuardar`,
`tabla-embalses`, `mensaje-error`...), de modo que se pueden apuntar a ella con
`mvn verify -Pe2e -DbaseUrl=http://localhost:8082/aquaapp/` (propiedad `baseUrl` de ese proyecto). Esa
ejecución no forma parte de las comprobaciones hechas aquí.

## Integración continua

Esta variante **todavía no tiene un workflow de GitHub Actions**. Cuando se añada, bastaría con `npm ci`,
`npm run lint`, `npm test`, `npm run build` y la construcción de la imagen Docker.

## Decisiones de implementación

> Solo se recogen las decisiones que **difieren del cliente original** (HTML + TypeScript sin framework, Bootstrap
> por CDN y clases `Model`/`View`/`Controller`).

### 1. Material UI en lugar de Bootstrap

El original usa Bootstrap 5 (CSS y JS por CDN) con atributos `data-bs-*` para desplegables, el menú plegable y el
modal. Aquí se usa **Material UI** (el sistema de componentes más habitual del ecosistema React) con
`@mui/icons-material` y la fuente Roboto autoalojada con `@fontsource/roboto` (sin CDN): `AppBar` + `Menu` para los
menús Embalses/Cuenta/Idioma, `Dialog` para login y registro, `Table` para el listado, `TextField` con `error` y
`helperText` para validar, `Button` con `loading` como indicador de carga, `Snackbar` + `Alert` para el 403 y
`Card` para «sesión no válida». El tema (`tema.ts`) usa como color primario el azul del logo. El aspecto, por tanto,
**no** es el de Bootstrap, pero la funcionalidad es la misma. En el menú, la barra se adapta a móvil dejando solo los
iconos en lugar del botón «hamburguesa» del original.

### 2. Contexto y *hooks* en lugar de `Model`/`View`/`Controller`

El estado de sesión y el idioma viajan por **Context** (`SesionProvider`, `I18nProvider`) y los datos por
*custom hooks* (`useEmbalses`, `useListado`), en lugar de clases con manejadores `onclick="controller..."`
globales. El filtro y la página viven en `App` (no en la vista del listado), así que **se conservan** al ir al
formulario y volver o al recargar tras una escritura, como hace el original; además, si tras borrar la página
actual deja de existir, se acota a la última.

### 3. Internacionalización por Context con los JSON del original

`public/i18n/es.json` y `en.json` son los del original (mismas claves) y se cargan con `fetch` en tiempo de
ejecución; `t()` devuelve la propia clave si falta. El idioma se guarda en `localStorage` (`idioma`) y, por defecto,
sale de `navigator.language`. Los números y fechas usan `Intl`. Se han añadido **dos claves** (`error.sinPermiso` y
`error.servidor`) porque el original dejaba «No tienes permiso para esta acción» fijo en español (y, de hecho, su
formulario no llegaba a mostrarlo); aquí aparece traducido en un `Snackbar`.

### 4. Proxy `/auth` en Nginx y resolución en tiempo de ejecución

El original llama al servicio de autenticación directamente en `http://localhost:9000`. Esta variante hace
`POST /auth/login` y `/auth/register` al **mismo origen** y Nginx los reenvía quitando el prefijo, igual que `/api/`:
un solo origen, sin CORS y sin URL fijas en el código. Las URL de destino se resuelven **en cada petición**
(`resolver 127.0.0.11` + `set $backend ...` + `proxy_pass $backend`), de modo que el contenedor arranca aunque
el stack Spring todavía no esté levantado. Además, se usa `absolute_redirect off` para que las redirecciones no
pierdan el puerto publicado (8082).

### 4 bis. Cabecera de versión de la API

Las rutas `/api/**` se versionan con la cabecera `X-API-Version`. El original no la envía (el backend asume `1.0`);
este cliente la envía de forma explícita en todas las peticiones a la API.

### 5. Gestión de errores con `ErrorApi`

`apiFetch` adjunta el JWT y lanza `ErrorApi` (con el código HTTP) cuando la respuesta no es 2xx; si el token falta o
ha caducado según el claim `exp`, lanza un 401 sin llegar a pedir nada. `App` decide: 401 → limpia la sesión y
muestra «Sesión no válida»; 403 → aviso de permisos; cualquier otro fallo → aviso genérico. El payload del JWT se
decodifica como *base64url* con UTF-8 (el original usa `atob` directamente).

### 6. Validación con estado de React

El original usa `setCustomValidity` + `reportValidity`. Aquí los campos obligatorios usan `required` (validación
nativa) y las reglas propias (contraseñas distintas, nivel mayor que la capacidad) se pintan con `error` y
`helperText` de MUI, y se limpian al editar el campo.

### 7. `data-listo` en `<body>`

Un *hook* (`useBodyListo`) pone `data-listo="<vista>"` en `<body>` cuando la vista actual está pintada (el listado,
una vez cargados los datos) y lo quita al cambiar de vista. Lo usa el script de capturas como selector
`body[data-listo]`.

### 8. Al salir se vacía la pantalla

Tras «Salir», el original deja el listado visible detrás del modal de login. Aquí se vacía la vista, para no
mostrar datos de una sesión cerrada.

## Licencia

Este proyecto se distribuye bajo licencia [MIT](https://opensource.org/licenses/MIT).

---

<p align="center">
  <img src="img/logo-epigijon.png" alt="Logo EPI Gijón" width="32" style="vertical-align: middle;"/>
  &nbsp;Tecnologías Web - Grado en Ingeniería Informática de Tecnologías de la Información
</p>
