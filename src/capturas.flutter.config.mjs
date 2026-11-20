// Configuración de capturas para la variante FLUTTER de aquaapp (aquaapp-frontend-flutter).
//
//   cd src
//   node capturar.mjs capturas.flutter.config.mjs ../aquaapp-frontend-flutter/img
//
// Requiere el stack en marcha: auth (AUTH_URL), backend y el contenedor del cliente Flutter en
// BASE_URL (por defecto http://localhost:8083/aquaapp/).
//
// Peculiaridades de Flutter Web (CanvasKit):
//  - Pinta en un <canvas>; los controles se localizan por el DOM de accesibilidad (flt-semantics),
//    que la app activa al arrancar. Los campos de texto se rellenan con el teclado (clic + teclear),
//    no con fill(): un fill() inmediato puede perderse porque Flutter reenvía su estado de edición.
//  - La app pone data-listo en <body> cuando la vista está pintada (selector `listo`).
//  - El PDF de Chrome incrusta el canvas como bitmap: ver `permitirBitmap` más abajo.
//
// Idioma: IDIOMA=es (por defecto) o IDIOMA=en. Los datos (nombres de embalses) los pone el backend.

const APP = process.env.BASE_URL ?? "http://localhost:8083/aquaapp/";
const AUTH = process.env.AUTH_URL ?? "http://localhost:9000";
const IDIOMA = process.env.IDIOMA === "en" ? "en" : "es";

const TXT = {
  es: {
    locale: "es-ES",
    filtro: "Filtrar por nombre", textoFiltro: "embalse de",
    usuario: "Usuario", entrar: "Entrar",
    nuevo: "Nuevo embalse",
    nombre: "Nombre", capacidad: "Capacidad (hm³)", nivel: "Nivel actual (hm³)", guardar: "Guardar",
    sinPermiso: "No tienes permiso para esta acción",
    pagina: /Página 1 de/,
    portada: "Aquaapp (Flutter): listado de embalses en escritorio y en móvil",
    principal: "Pantalla principal: listado de embalses",
    login: "Inicio de sesión",
    filtros: "Listado de embalses filtrado por nombre",
    formulario: "Formulario de alta de embalse",
    permiso: "Aviso de falta de permiso (rol USER)",
    alta: "Listado tras crear un embalse (rol ADMIN)",
  },
  en: {
    locale: "en-US",
    filtro: "Filter by name", textoFiltro: "embalse de",
    usuario: "Username", entrar: "Log in",
    nuevo: "New reservoir",
    nombre: "Name", capacidad: "Capacity (hm³)", nivel: "Current level (hm³)", guardar: "Save",
    sinPermiso: "You do not have permission for this action",
    pagina: /Page 1 of/,
    portada: "Aquaapp (Flutter): reservoir list on desktop and mobile",
    principal: "Main screen: reservoir list",
    login: "Log in",
    filtros: "Reservoir list filtered by name",
    formulario: "New reservoir form",
    permiso: "Missing-permission notice (USER role)",
    alta: "List after creating a reservoir (ADMIN role)",
  },
}[IDIOMA];

// Embalse que crea la captura de alta (y que se borra antes de cada dispositivo, para que
// escritorio y móvil muestren lo mismo). Solo se toca este nombre: el backend es compartido.
const EMBALSE_CAPTURA = "Embalse de Ponga";

const CUENTAS = {
  ana: { usuario: "ana", password: "1234" }, // USER: solo lectura
  admin: { usuario: "admin", password: "admin" }, // ADMIN: puede escribir
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

/** Borra (por la API del cliente, con el JWT de admin) los embalses que crea esta config. */
async function limpiarEmbalseCaptura() {
  const jwt = await token("admin");
  const api = new URL("/api/embalses", APP).href;
  const cab = { authorization: `Bearer ${jwt}` };
  const lista = await (await fetch(api, { headers: cab })).json();
  for (const e of lista.filter((x) => x.nombre === EMBALSE_CAPTURA)) {
    await fetch(`${api}/${e.id}`, { method: "DELETE", headers: cab });
  }
}

const pausa = (page, ms = 400) => page.waitForTimeout(ms);

/** Rellena un campo de Flutter: clic para enfocar y teclear (sin fill(), ver arriba). */
async function escribir(page, etiqueta, texto) {
  await page.getByLabel(etiqueta, { exact: true }).click();
  await pausa(page, 250);
  await page.keyboard.press("Control+A");
  await page.keyboard.type(texto, { delay: 15 });
  await pausa(page, 250);
}

/** Botón flotante «Nuevo embalse» del listado (en móvil y en escritorio). */
async function abrirFormulario(page) {
  await page.getByRole("button", { name: TXT.nuevo }).click();
  await page.getByLabel(TXT.nombre, { exact: true }).waitFor();
  await page.waitForSelector("body[data-listo]");
  await pausa(page, 500);
}

async function rellenarFormulario(page) {
  await escribir(page, TXT.nombre, EMBALSE_CAPTURA);
  await escribir(page, TXT.capacidad, "120");
  await escribir(page, TXT.nivel, "85.5");
}

export default {
  baseUrl: APP,
  locale: TXT.locale,

  // La app pone data-listo en <body> al terminar de pintar cada vista.
  listo: "body[data-listo]",

  dispositivos: {
    escritorio: { w: 1280, h: 800 },
    movil: { w: 390, h: 844 },
  },

  // Flutter Web con CanvasKit pinta en <canvas>: el PDF de Chrome lo incrusta como imagen y el
  // SVG final lleva un bitmap (texto, iconos y bordes ya no son vectores). Ver README del proyecto.
  permitirBitmap: true,

  // Idioma en localStorage ("idioma") y, si la pantalla lo pide, JWT en sessionStorage ("jwt").
  async preparar(contexto, pantalla) {
    await contexto.addInitScript((idioma) => localStorage.setItem("idioma", idioma), IDIOMA);
    if (!pantalla.cuenta) return;
    await contexto.addInitScript((t) => sessionStorage.setItem("jwt", t), await token(pantalla.cuenta));
  },

  // Deja el backend como estaba antes de cada dispositivo (la última pantalla crea un embalse).
  async antesDeDispositivo(_nombre) {
    await limpiarEmbalseCaptura();
  },

  // Pantalla principal (solo para la portada): listado como administrador, con el panel de indicadores.
  principal: {
    id: "listado", ruta: "", cuenta: "admin", titulo: TXT.principal,
    async accion(page) {
      await page.getByText(TXT.pagina).first().waitFor();
      await pausa(page, 600);
    },
  },
  portada: { fichero: "hero-aquaapp-flutter.svg", url: "localhost:8083/aquaapp/", titulo: TXT.portada },

  pantallas: [
    {
      // Sin sesión: la app abre el diálogo de login.
      id: "login", ruta: "", cuenta: null, titulo: TXT.login,
      async accion(page) {
        await page.getByLabel(TXT.usuario, { exact: true }).waitFor();
        await pausa(page, 700); // animación de entrada del diálogo
      },
    },
    {
      id: "listado-filtros", ruta: "", cuenta: "ana", titulo: TXT.filtros,
      async accion(page) {
        await page.getByText(TXT.pagina).first().waitFor();
        await escribir(page, TXT.filtro, TXT.textoFiltro);
        await pausa(page, 600);
      },
    },
    {
      id: "formulario-alta", ruta: "", cuenta: "admin", titulo: TXT.formulario,
      async accion(page) {
        await page.getByText(TXT.pagina).first().waitFor();
        await abrirFormulario(page);
        await rellenarFormulario(page);
      },
    },
    {
      // Un usuario USER intenta escribir: el backend responde 403 y se avisa con un SnackBar.
      id: "sin-permiso", ruta: "", cuenta: "ana", titulo: TXT.permiso,
      async accion(page) {
        await page.getByText(TXT.pagina).first().waitFor();
        await abrirFormulario(page);
        await rellenarFormulario(page);
        await page.getByRole("button", { name: TXT.guardar }).click();
        await page.getByText(TXT.sinPermiso).first().waitFor();
        await pausa(page, 700); // animación del SnackBar
      },
    },
    {
      // Esta acción ESCRIBE datos (crea un embalse): va la última.
      id: "alta-guardada", ruta: "", cuenta: "admin", titulo: TXT.alta,
      async accion(page) {
        await page.getByText(TXT.pagina).first().waitFor();
        await abrirFormulario(page);
        await rellenarFormulario(page);
        await page.getByRole("button", { name: TXT.guardar }).click();
        // De vuelta en el listado (el formulario no tiene paginador) y con la recarga terminada.
        await page.getByText(TXT.pagina).first().waitFor();
        await page.waitForSelector("body[data-listo]");
        await pausa(page, 900);
      },
    },
  ],
};
