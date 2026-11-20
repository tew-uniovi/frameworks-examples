# Pruebas de sistema (E2E) — aquaapp con Angular, React y Flutter

Una **única suite de [Playwright](https://playwright.dev/)** que se ejecuta tal cual contra los tres clientes de
*aquaapp*, y comprueba que se comportan igual: login, registro, listado, edición y borrado de embalses. Cada cliente
es un *proyecto* de Playwright (`angular`, `react`, `flutter`); lo único que cambia entre ellos es la URL y el atributo
HTML donde se publican los identificadores de prueba.

## Qué cubre

| # | Caso | Detalle |
|---|---|---|
| 1 | Login correcto | `admin` y `ana`: aparece `menu-sesion` con el usuario y `listado-tabla` |
| 2 | Login fallido | contraseña incorrecta: aparece `auth-error` y la sesión no se inicia (`menu-sesion` sigue en «Cuenta») |
| 3 | Registro | usuario único `e2e-<timestamp>`: registrar, se abre el login, iniciar sesión con la cuenta nueva; y registro con contraseñas distintas (`auth-error`, no se crea la cuenta) |
| 4 | Listar | embalse de prueba creado por API: su fila aparece (con nombre y capacidad) tras filtrar por su nombre |
| 5 | Editar | como `admin`, cambia el nivel de 40 a 55; la fila lo refleja y la API lo confirma |
| 6 | Eliminar | como `admin`, la fila desaparece y la API ya no devuelve el embalse |

Además hay una prueba de cierre de sesión (`menu-logout`).

> **Usuarios `e2e-*`:** el servicio de autenticación guarda los usuarios en memoria y no ofrece borrado, así que cada
> ejecución del caso de registro deja una cuenta `e2e-<timestamp>` hasta que se reinicie ese servicio. Los **embalses**
> sí se limpian: cada prueba crea el suyo por API (`E2E-<framework>-<timestamp>-<n>`) y lo borra al terminar, falle o
> no, y al final de la suite se borra cualquier embalse cuyo nombre empiece por `E2E-`.

## Requisitos

- Node.js 24 (o similar) y npm.
- Los tres clientes y el backend levantados (ver el [README raíz](../README.md#puesta-en-marcha)): primero el stack de
  `YYyy-tew-ZZ-UOXXXXX`, que crea la red `aquaapp-network`, y después `docker compose up -d --build` en la raíz.
- En local se usa el **Chrome instalado en el sistema** (`channel: 'chrome'`); en CI (`CI=true`) el Chromium de
  Playwright (`npx playwright install --with-deps chromium`).

## Cómo ejecutarlas

```bash
cd E2E
npm ci

npx playwright test                      # los tres clientes
npx playwright test --project=angular    # solo uno (también: react, flutter)
npm run test:react                       # atajos: test:angular | test:react | test:flutter
npm run report                           # abre el informe HTML (playwright-report/)
```

Las pruebas se ejecutan en escritorio (1280x800) y con `locale: 'es-ES'`. Con `workers: 1`, porque el backend es
compartido y guarda los datos en memoria.

### Variables de entorno

| Variable | Por defecto | Uso |
|---|---|---|
| `ANGULAR_URL` | `http://localhost:8081/aquaapp/` | URL del cliente Angular |
| `REACT_URL` | `http://localhost:8082/aquaapp/` | URL del cliente React |
| `FLUTTER_URL` | `http://localhost:8083/aquaapp/` | URL del cliente Flutter |
| `CI` | _(sin definir)_ | Usa el Chromium de Playwright, `retries: 1` y el reporter de GitHub |

La API se consulta a través del origen de cada cliente (`/auth/*` y `/api/*` pasan por su nginx), de modo que las
pruebas también ejercitan el proxy.

## Contrato de identificadores

Las pruebas localizan todo con `page.getByTestId(...)`. El atributo cambia según el framework y lo fija
`playwright.config.ts` con `use.testIdAttribute` **por proyecto**:

| Cliente | Atributo | Cómo se publica |
|---|---|---|
| Angular, React | `data-testid` | atributo HTML |
| Flutter | `flt-semantics-identifier` | `Semantics(identifier: ...)` |

| Zona | Identificadores |
|---|---|
| Navegación | `menu-embalses`, `menu-listado`, `menu-nuevo`, `menu-sesion` (contiene «Hola, \<usuario\>» con sesión y «Cuenta» sin ella), `menu-login`, `menu-registro`, `menu-logout` |
| Diálogo de acceso | `auth-dialogo`, `auth-usuario`, `auth-password`, `auth-password2` (solo registro), `auth-enviar`, `auth-cancelar`, `auth-cambiar` (login ↔ registro), `auth-error` (solo tras un fallo) |
| Listado | `listado-filtro`, `listado-tabla`, `fila-embalse-<id>` (contiene nombre, capacidad y nivel), `editar-embalse-<id>`, `eliminar-embalse-<id>` |
| Formulario | `form-nombre`, `form-capacidad`, `form-nivel`, `form-guardar` |
| Avisos | `aviso` (error, p. ej. 403), `sesion-no-valida` |

## Estructura

```
📁 E2E/
├── 📄 playwright.config.ts        # tres proyectos (angular, react, flutter), URL y testIdAttribute por proyecto
├── 📄 package.json
├── 📄 tsconfig.json
└── 📁 tests/
    ├── 📄 aquaapp.spec.ts         # la suite, común a los tres clientes
    └── 📁 helpers/
        ├── 📄 aquaapp.ts          # page object (login, registro, listado...) y escribir()
        ├── 📄 api.ts              # cliente fetch del backend (JWT por /auth/login, /api/embalses)
        └── 📄 fixtures.ts         # fixtures app / api / embalse y limpieza global de E2E-*
```

Escribir en los campos pasa siempre por `escribir(locator, texto)`: click, `Control+A` y teclear. En Flutter Web un
`fill()` inmediato puede perderse, y así los tres clientes se tratan igual.

## Integración continua

El workflow [`e2e.yml`](../.github/workflows/e2e.yml) se ejecuta en cada PR (también los de Dependabot), en cada push a
`main` y a mano. Por cada framework de la matriz: levanta el backend, construye la imagen del cliente, la levanta, pasa
la suite (`--project=<framework>`) y sube el informe HTML y los resultados como artefacto (`e2e-<framework>`).

El backend y el servicio de autenticación se levantan con [`docker-compose.backend.yml`](../docker-compose.backend.yml), a
partir de las imágenes privadas `aquaapp-backend` y `aquaapp-auth` que publica en GHCR el repositorio del backend
(`YYyy-tew-ZZ-UOXXXXX`); este repositorio no las construye. Para poder bajarlas:

- **Acceso de Actions a los paquetes** (paso manual, una sola vez; no se puede hacer por API ni desde un workflow): en
  los ajustes de **cada** paquete (`aquaapp-backend` y `aquaapp-auth`) → *Manage Actions access* → *Add repository* →
  solo este repositorio (`frameworks-examples`), con el rol *Read*. Con eso basta el `GITHUB_TOKEN` del workflow (que
  declara `permissions: packages: read`), también en los PRs de Dependabot. No hace falta ningún PAT.
- Opcional y no recomendado: el secreto `GHCR_TOKEN`, que si existe sustituye al `GITHUB_TOKEN`. Un PAT clásico con
  `read:packages` da lectura a **todos** los paquetes del usuario; si se usa, hay que crearlo también en *Settings →
  Secrets and variables → Dependabot*.
- Variables de repositorio opcionales `BACKEND_IMAGE` y `AUTH_IMAGE`, para usar otras imágenes; si no existen se usan
  las del compose (`ghcr.io/tew-uniovi/aquaapp-backend:latest` y `ghcr.io/tew-uniovi/aquaapp-auth:latest`).
