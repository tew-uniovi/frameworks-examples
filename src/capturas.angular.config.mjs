// Configuración de capturas de la variante ANGULAR (Angular Material) de aquaapp.
//
// Requisitos: la app servida en http://localhost:8081/aquaapp/ (contenedor aquaapp-frontend-angular)
// y el servicio de autenticación del stack Spring en http://localhost:9000.
//
// Uso (desde src/):
//   node capturar.mjs capturas.angular.config.mjs ../aquaapp-frontend-angular/img
//
// Variables: BASE_URL, AUTH_URL e IDIOMA ("es" por defecto, o "en").
// Ninguna pantalla modifica datos del backend (el 403 se queda en el intento de escritura).

const APP = process.env.BASE_URL ?? "http://localhost:8081/aquaapp/";
const AUTH = process.env.AUTH_URL ?? "http://localhost:9000";
const IDIOMA = process.env.IDIOMA === "en" ? "en" : "es";

// Textos que dependen del idioma: el filtro que se escribe y los títulos accesibles (<title>) de los SVG
const TXT = {
  es: {
    locale: "es-ES",
    filtro: "Tanes",
    portada: "aquaapp (Angular): listado de embalses en escritorio y en móvil",
    principal: "Pantalla principal: listado de embalses",
    login: "Inicio de sesión",
    filtrado: "Listado de embalses filtrado por nombre",
    alta: "Formulario de alta de embalse",
    admin: "Listado con el menú de embalses abierto",
    prohibido: "Error 403: sin permiso para escribir",
  },
  en: {
    locale: "en-US",
    filtro: "Tanes",
    portada: "aquaapp (Angular): reservoir list on desktop and mobile",
    principal: "Main screen: reservoir list",
    login: "Log in",
    filtrado: "Reservoir list filtered by name",
    alta: "New reservoir form",
    admin: "List with the reservoirs menu open",
    prohibido: "Error 403: no permission to write",
  },
}[IDIOMA];

// Cuentas semilla del stack Spring (README de tew-profes-lab-spring)
const CUENTAS = {
  ana: { usuario: "ana", password: "1234" }, // rol USER: solo lectura
  admin: { usuario: "admin", password: "admin" }, // rol ADMIN: puede escribir
};

/** Inicia sesión contra el servicio de autenticación y devuelve el JWT. */
async function token(cuenta) {
  const r = await fetch(`${AUTH}/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(CUENTAS[cuenta]),
  });
  if (!r.ok) throw new Error(`Login de "${cuenta}" fallido (${r.status}): ¿está arrancado el servicio de autenticación?`);
  return (await r.json()).token;
}

const esperarDialogo = async (page) => {
  await page.waitForSelector("mat-dialog-container");
  await page.waitForTimeout(500); // fin de la animación de apertura del diálogo
};

const abrirAlta = async (page) => {
  await page.click("#menuEmbalses");
  await page.click("#btnAlta");
  await page.waitForSelector("#form-embalse");
  await page.waitForTimeout(300);
  await page.waitForSelector("body[data-listo]");
};

export default {
  baseUrl: APP,
  locale: TXT.locale,
  prefijo: "captura-",

  // <body data-listo> lo pone la app cuando la vista actual ya está pintada
  listo: "body[data-listo]",

  dispositivos: {
    escritorio: { w: 1280, h: 800 },
    movil: { w: 390, h: 844 },
  },

  // Idioma en localStorage["idioma"] y, si la pantalla lo pide, JWT en sessionStorage["jwt"]
  async preparar(contexto, pantalla) {
    await contexto.addInitScript((idioma) => localStorage.setItem("idioma", idioma), IDIOMA);
    if (!pantalla.cuenta) return;
    await contexto.addInitScript((t) => sessionStorage.setItem("jwt", t), await token(pantalla.cuenta));
  },

  // Angular Material usa sombras (elevación) y capas translúcidas que Chrome exporta como bitmap al PDF:
  // se anulan, y se dibuja un borde fino para que diálogos, menús y avisos sigan distinguiéndose.
  css: `
    *, *::before, *::after { box-shadow: none !important; text-shadow: none !important; filter: none !important; }
    .mat-mdc-dialog-surface, .mat-mdc-menu-panel, .mat-mdc-snack-bar-container .mdc-snackbar__surface {
      border: 1px solid #c3c9d4 !important;
    }
    .cdk-overlay-dark-backdrop { background: #8d8f96 !important; opacity: 1 !important; }
  `,

  // Pantalla principal (solo compone la portada): el listado
  principal: { id: "listado", ruta: "", cuenta: "ana", titulo: TXT.principal },
  portada: { fichero: "hero-aquaapp-angular.svg", url: "localhost:8081/aquaapp/", titulo: TXT.portada },

  pantallas: [
    // Sin sesión: la app arranca con el diálogo de login
    {
      id: "login", ruta: "", cuenta: null, titulo: TXT.login,
      async accion(page) {
        await esperarDialogo(page);
        // capturar.mjs hace blur() antes de exportar: sin esto el campo enfocado pasaria a "tocado" y mostraria el error
        await page.evaluate(() => { HTMLElement.prototype.blur = () => {}; });
      },
    },
    // Usuario de solo lectura, con el filtro por nombre aplicado
    {
      id: "listado-filtro", ruta: "", cuenta: "ana", titulo: TXT.filtrado,
      async accion(page) {
        await page.waitForSelector("tr.mat-mdc-row");
        await page.fill("#filtro-nombre", TXT.filtro);
        await page.waitForFunction(() => document.querySelectorAll("tr.mat-mdc-row:not(.mat-mdc-no-data-row)").length === 1);
      },
    },
    // Formulario de alta con datos de ejemplo (sin guardar)
    {
      id: "alta", ruta: "", cuenta: "admin", titulo: TXT.alta,
      async accion(page) {
        await page.waitForSelector("tr.mat-mdc-row");
        await abrirAlta(page);
        await page.fill("#nombre", IDIOMA === "es" ? "Embalse de Alfilorios" : "Alfilorios reservoir");
        await page.fill("#capacidadHm3", "35.5");
        await page.fill("#nivelActualHm3", "40");
        await page.click("#btnGuardar"); // nivel > capacidad: no se envía, se ve la validación
        await page.waitForSelector("mat-error");
        await page.waitForTimeout(300);
      },
    },
    // Administrador en el listado, con el desplegable "Embalses" abierto
    {
      id: "listado-menu", ruta: "", cuenta: "admin", titulo: TXT.admin,
      async accion(page) {
        await page.waitForSelector("tr.mat-mdc-row");
        await page.click("#menuEmbalses");
        await page.waitForSelector("#btnAlta");
        await page.waitForTimeout(400);
      },
    },
    // Usuario de solo lectura intenta escribir: 403 en un aviso (no se guarda nada)
    {
      id: "error-403", ruta: "", cuenta: "ana", titulo: TXT.prohibido,
      async accion(page) {
        await page.waitForSelector("tr.mat-mdc-row");
        await abrirAlta(page);
        await page.fill("#nombre", IDIOMA === "es" ? "Embalse de Alfilorios" : "Alfilorios reservoir");
        await page.fill("#capacidadHm3", "35.5");
        await page.fill("#nivelActualHm3", "20");
        await page.click("#btnGuardar");
        await page.waitForSelector("mat-snack-bar-container");
        await page.waitForTimeout(500);
      },
    },
  ],
};
