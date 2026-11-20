<p align="center">
  <img src="aquaapp-frontend-react/img/logo-epigijon.png" alt="Logo de la Escuela Politécnica de Ingeniería de Gijón (Universidad de Oviedo)" width="240"/>
</p>

# Aquaapp con distintos frameworks — Tecnologías Web

Un mismo cliente web, **tres implementaciones**. Este repositorio contiene el cliente de *aquaapp* (gestión de
embalses) reescrito en **Angular**, **React** y **Flutter**, con las mismas funcionalidades y la misma API: login y
registro con JWT, CRUD de embalses con filtro y paginación, panel de indicadores, selector de idioma (es/en) y
tratamiento de errores `401` y `403`. Cada variante usa los componentes e iconos propios de su ecosistema, para que
parezca una aplicación nativa de ese framework.

Las tres consumen el backend de la práctica (servicio de autenticación en Rust y API REST en Spring Boot), que vive
en tu repositorio `YYyy-tew-ZZ-UOXXXXX`, y se conectan a él a través de una red de Docker compartida.

> `YYyy-tew-ZZ-UOXXXXX` es la plantilla del nombre del repositorio del backend: `YYyy` son el año del curso y el
> siguiente, `ZZ` el número de PL (`01`, `02`, `03`...) y `UOXXXXX` tu UO. Por ejemplo, `2627-tew-01-UO123456`.

Estos son los clientes disponibles:

- **[Angular](aquaapp-frontend-angular/README.md)** — Angular 22 + Angular Material (Material 3) · `http://localhost:8081/aquaapp/`
- **[React](aquaapp-frontend-react/README.md)** — React 19 + Vite + Material UI · `http://localhost:8082/aquaapp/`
- **[Flutter](aquaapp-frontend-flutter/README.md)** — Flutter Web + Material 3 · `http://localhost:8083/aquaapp/`

---

## Angular

<p align="center">
  <img src="aquaapp-frontend-angular/img/hero-aquaapp-angular.svg" alt="Cliente de aquaapp en Angular, en escritorio y en móvil" width="900"/>
</p>

## React

<p align="center">
  <img src="aquaapp-frontend-react/img/hero-aquaapp-react.svg" alt="Cliente de aquaapp en React, en escritorio y en móvil" width="900"/>
</p>

## Flutter

<p align="center">
  <img src="aquaapp-frontend-flutter/img/hero-aquaapp-flutter.svg" alt="Cliente de aquaapp en Flutter, en escritorio y en móvil" width="900"/>
</p>

---

## ¿Por qué estos tres frameworks?

La elección de React y Angular se apoya en el análisis de popularidad de
[Thomas Krotoff, «React vs others»](https://gist.github.com/tkrotoff/b1caa4c3a185629299ec234d2314e190), que recopila
desde 2018 encuestas (Stack Overflow, State of JS, JetBrains), descargas de npm y otras fuentes. Conviene leerlo con
cautela: es un recopilatorio de un autor independiente, con gráficas de fuentes distintas, y mide **popularidad y
ecosistema**, no calidad técnica.

### React y Angular: los dos frameworks web más usados

| Framework | Uso (State of JS 2025) | Popularidad (Stack Overflow 2025) | Satisfacción (State of JS 2025) |
|---|---|---|---|
| **React** | 85 % | 44,7 % | 72 % |
| **Angular** | 48 % | 18,2 % | 48 % |
| Vue | 52 % | 17,6 % | 84 % |
| Svelte | 27 % | 7,2 % | 86 % |

- **React** es, con diferencia, el más usado en todas las encuestas del artículo. Su conclusión es que sigue creciendo
  más rápido que las alternativas y que estas, aunque quizá técnicamente mejores, no lo son lo bastante como para
  compensar el coste de migrar y reaprender; además, un framework de interfaz tiene un fuerte **efecto red**: al
  usar el más popular se hereda todo su ecosistema de herramientas y librerías (aquí, por ejemplo, Material UI).
- **Angular** es la otra gran referencia: queda por delante de Vue y de Svelte en popularidad en Stack Overflow
  (18,2 %) y, según JetBrains 2023, lo usa un 20 % de los desarrolladores. Aporta un contrapunto útil a React: es un
  framework completo y con criterio propio (inyección de dependencias, formularios, cliente HTTP y *signals* de serie),
  frente a una biblioteca que se completa con el ecosistema.
- **Vue y Svelte** quedan fuera. El artículo los valora mejor (satisfacción del 84 % y el 86 %), pero su uso es
  bastante menor (52 % y 27 %), así que aportan menos para comparar enfoques ampliamente utilizados.

La contrapartida de Angular también aparece en los datos: su satisfacción (48 % en State of JS 2025, 44,7 % «admirado»
en Stack Overflow) es la más baja de las cuatro. Se ha mantenido porque interesa comparar un framework muy extendido
y estructurado con una biblioteca ligera, no porque sea el más querido.

### Flutter: desarrollo multiplataforma y nativo

Flutter se incluye porque es un entorno de desarrollo **multiplataforma y nativo para Android (e iOS)**: permite crear
aplicaciones nativas para ambos sistemas operativos a partir de una misma base de código.

## Arquitectura

Cada cliente es una imagen de **nginx** que sirve la aplicación compilada bajo `/aquaapp/` y reenvía `/api/*` al
backend y `/auth/*` al servicio de autenticación, de modo que el navegador siempre habla con un único origen (sin
CORS). Todos los contenedores comparten la red `aquaapp-network`, que crea el `docker-compose.yml` de
`YYyy-tew-ZZ-UOXXXXX`.

```mermaid
flowchart LR
    NAV["🧑 Navegador"]

    subgraph FW["frameworks-examples (este repositorio)"]
        ANG["angular<br/>:8081"]
        REA["react<br/>:8082"]
        FLU["flutter<br/>:8083"]
    end

    subgraph SPR["YYyy-tew-ZZ-UOXXXXX · red aquaapp-network"]
        BACK["backend<br/>Spring Boot :8080"]
        AUTH["auth<br/>Rust :9000"]
    end

    NAV --> ANG & REA & FLU
    ANG & REA & FLU -- "/api/*" --> BACK
    ANG & REA & FLU -- "/auth/*" --> AUTH
```

## Puesta en marcha

Hace falta [Docker](https://docs.docker.com/get-docker/) con Compose. Primero se arranca el backend, que crea la red
compartida, y después los tres clientes:

```bash
# 1. Backend y autenticación (repositorio YYyy-tew-ZZ-UOXXXXX): crea la red aquaapp-network
cd ../YYyy-tew-ZZ-UOXXXXX
docker compose up -d --build

# 2. Los tres clientes de este repositorio, cada uno en su puerto
cd ../frameworks-examples
docker compose up -d --build
```

| Cliente | URL | Puerto | Variable |
|---|---|---|---|
| Angular | http://localhost:8081/aquaapp/ | `8081` | `ANGULAR_PORT` |
| React | http://localhost:8082/aquaapp/ | `8082` | `REACT_PORT` |
| Flutter | http://localhost:8083/aquaapp/ | `8083` | `FLUTTER_PORT` |

Se puede arrancar solo una variante (`docker compose up -d --build react`). Los puertos, el nombre de la red
(`AQUAAPP_NETWORK`) y los destinos del proxy (`BACKEND_URL`, `AUTH_URL`) se cambian con un fichero `.env`; hay un
ejemplo en [`.env.example`](.env.example).

Usuarios de prueba del servicio de autenticación:

| Usuario | Contraseña | Rol |
|---|---|---|
| `ana` | `1234` | `USER` (solo lectura) |
| `admin` | `admin` | `ADMIN` (puede crear, editar y borrar) |

## Estructura del repositorio

```
📁 frameworks-examples/
├── 📁 aquaapp-frontend-angular/   # Angular + Angular Material
├── 📁 aquaapp-frontend-react/     # React + Vite + Material UI
├── 📁 aquaapp-frontend-flutter/   # Flutter Web + Material 3
├── 📁 E2E/                        # pruebas de sistema con Playwright (una suite para los tres clientes)
├── 📁 .github/
│   ├── 📁 workflows/
│   │   └── 📄 e2e.yml             # ejecuta las pruebas de sistema en cada PR, push a main y a mano
│   └── 📄 dependabot.yml          # actualizaciones mensuales de dependencias, imágenes de Docker y acciones
├── 📄 docker-compose.yml          # despliega los tres clientes en la red aquaapp-network
└── 📄 .env.example
```

## Pruebas de sistema

La carpeta [`E2E/`](E2E/README.md) contiene **una única suite de [Playwright](https://playwright.dev/)** que se
ejecuta contra los tres clientes y comprueba que se comportan igual: login (correcto y fallido), registro, y listado,
edición y borrado de embalses. Cada cliente es un proyecto (`angular`, `react`, `flutter`) y se localiza todo con
identificadores de prueba comunes (`data-testid` en Angular y React; `Semantics(identifier)` en Flutter).

Para ejecutarlas en local hace falta el stack levantado (ver [Puesta en marcha](#puesta-en-marcha)) y Chrome:

```bash
cd E2E
npm ci
npx playwright test                    # los tres clientes
npx playwright test --project=react    # solo uno
```

El workflow [`e2e.yml`](.github/workflows/e2e.yml) las lanza en cada PR, también en los de Dependabot: levanta el
backend y auth desde las imágenes que publica en GHCR el repositorio del backend
([`docker-compose.backend.yml`](docker-compose.backend.yml)), construye la imagen del cliente, lo arranca y pasa la
suite (un trabajo por framework). Requiere un paso manual, una sola vez: en los ajustes de cada paquete de GHCR
(`aquaapp-backend` y `aquaapp-auth`) → *Manage Actions access* → *Add repository* → solo este repositorio, con rol
*Read*; con eso basta el `GITHUB_TOKEN` del workflow, también en los PRs de Dependabot. Admite además el secreto
opcional `GHCR_TOKEN` (un PAT con `read:packages`, no recomendado porque da lectura a todos los paquetes del usuario)
y las variables opcionales `BACKEND_IMAGE` y `AUTH_IMAGE`. Más detalles en [`E2E/README.md`](E2E/README.md).

## Dependencias

[Dependabot](.github/dependabot.yml) revisa cada mes las dependencias de cada cliente (`npm` y `pub`), las
imágenes base de sus Dockerfile, las de las pruebas de sistema (`E2E/`) y las acciones de GitHub. Los PRs se asignan
a `augustocristian` y se etiquetan por framework (`angular`, `react`, `flutter`, `e2e`, `github-actions`) y por
lenguaje (`ts`, `js`, `dart`, `docker`). Las subidas menores y de parche se agrupan en un
solo PR por carpeta para evitar conflictos entre ellos.

## ¿Tienes algún problema?

Si encuentras un error o tienes alguna duda, [**abre una issue**](https://github.com/tew-uniovi/frameworks-examples/issues/new).

---

<p align="center">
  <img src="aquaapp-frontend-react/img/logo-epigijon.png" alt="Logo EPI Gijón" width="32" style="vertical-align: middle;"/>
  &nbsp;Tecnologías Web - Grado en Ingeniería Informática de Tecnologías de la Información
</p>
