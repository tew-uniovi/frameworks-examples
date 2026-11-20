// Configuración de las capturas de la variante REACT de aquaapp (Material UI).
//
//   cd src && node capturar.mjs capturas.react.config.mjs ../aquaapp-frontend-react/img
//
// La aplicación (contenedor aquaapp-frontend-react en el puerto 8082) y el stack Spring (auth + backend)
// tienen que estar YA en marcha. Ninguna pantalla modifica datos del backend.
//
// Idioma de las capturas: variable IDIOMA = "es" (por defecto) o "en".

const APP = process.env.BASE_URL ?? "http://localhost:8082/aquaapp/";
const AUTH = process.env.AUTH_URL ?? "http://localhost:9000";
const IDIOMA = process.env.IDIOMA === "en" ? "en" : "es";

const TXT = {
  es: {
    locale: "es-ES",
    filtro: "Tanes",
    portada: "aquaapp (React): listado de embalses en escritorio y en móvil",
    principal: "Pantalla principal: listado de embalses",
    login: "Inicio de sesión",
    filtrado: "Listado de embalses filtrado por nombre",
    formulario: "Formulario de alta de embalse",
    sinPermiso: "Aviso de falta de permiso (403) para un usuario de solo lectura",
    sesionNoValida: "Sesión no válida",
    nombre: "Embalse de Prueba",
  },
  en: {
    locale: "en-US",
    filtro: "Tanes",
    portada: "aquaapp (React): reservoir list on desktop and mobile",
    principal: "Main screen: reservoir list",
    login: "Log in",
    filtrado: "Reservoir list filtered by name",
    formulario: "New reservoir form",
    sinPermiso: "Missing-permission notice (403) for a read-only user",
    sesionNoValida: "Session not valid",
    nombre: "Test reservoir",
  },
}[IDIOMA];

// Cuentas semilla de aquaapp-auth (README de tew-profes-lab-spring)
const CUENTAS = {
  ana: { usuario: "ana", password: "1234" },
  admin: { usuario: "admin", password: "admin" },
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

/** JWT con forma válida y sin caducar pero con firma incorrecta: el backend responde 401. */
function tokenInvalido() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "ana", exp: Math.floor(Date.now() / 1000) + 3600 })}.firma-invalida`;
}

/** Abre el menú Embalses y pulsa una de sus entradas. */
async function irA(page, idEntrada) {
  await page.click("#menuEmbalses");
  await page.click(idEntrada);
  await page.waitForSelector("#menuEmbalses-menu", { state: "detached" });
}

export default {
  baseUrl: APP,
  locale: TXT.locale,

  // La app pone data-listo en <body> cuando la vista actual está pintada
  listo: "body[data-listo]",

  dispositivos: {
    escritorio: { w: 1280, h: 800 },
    movil: { w: 390, h: 844 },
  },

  // Sesión en sessionStorage["jwt"] e idioma en localStorage["idioma"]
  async preparar(contexto, pantalla) {
    await contexto.addInitScript((idioma) => localStorage.setItem("idioma", idioma), IDIOMA);
    const jwt = pantalla.cuenta === "invalida" ? tokenInvalido() : pantalla.cuenta ? await token(pantalla.cuenta) : null;
    if (jwt) await contexto.addInitScript((t) => sessionStorage.setItem("jwt", t), jwt);
  },

  // Material UI usa sombras con desenfoque (box-shadow), transiciones y ondas (ripple): Chrome exportaría
  // las sombras a PDF como bitmap. Se anulan, igual que las animaciones, para capturar el estado final.
  css: `
    *, *::before, *::after { box-shadow: none !important; transition: none !important; animation: none !important; text-shadow: none !important; }
    .MuiTouchRipple-root { display: none !important; }
  `,

  principal: { id: "listado", ruta: "", cuenta: "admin", titulo: TXT.principal },
  portada: { fichero: "hero-aquaapp-react.svg", url: "localhost:8082/aquaapp/", titulo: TXT.portada },

  pantallas: [
    { id: "login", ruta: "", cuenta: null, titulo: TXT.login },
    {
      id: "listado-filtro", ruta: "", cuenta: "admin", titulo: TXT.filtrado,
      async accion(page) {
        await page.fill("#filtro-nombre", TXT.filtro);
        await page.waitForFunction(
          (t) => [...document.querySelectorAll("#tabla-embalses tr")].every((tr) => tr.textContent.includes(t)),
          TXT.filtro,
        );
      },
    },
    {
      id: "formulario", ruta: "", cuenta: "admin", titulo: TXT.formulario,
      async accion(page) {
        await irA(page, "#btnAlta");
        await page.waitForSelector("#form-embalse");
        await page.fill("#nombre", TXT.nombre);
        await page.fill("#capacidadHm3", "120.5");
        await page.fill("#nivelActualHm3", "80");
      },
    },
    {
      // Usuario de solo lectura (ana) intentando escribir: el backend responde 403. No cambia ningún dato.
      id: "sin-permiso", ruta: "", cuenta: "ana", titulo: TXT.sinPermiso,
      async accion(page) {
        await irA(page, "#btnAlta");
        await page.fill("#nombre", TXT.nombre);
        await page.fill("#capacidadHm3", "120.5");
        await page.fill("#nivelActualHm3", "80");
        await page.click("#btnGuardar");
        await page.waitForSelector("#mensaje-error");
      },
    },
    { id: "sesion-no-valida", ruta: "", cuenta: "invalida", titulo: TXT.sesionNoValida,
      async accion(page) { await page.waitForSelector("#btnIrAlLogin"); } },
  ],
};
