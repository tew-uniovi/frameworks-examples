import { expect, test } from './helpers/fixtures';

// Suite única: se ejecuta tal cual contra Angular, React y Flutter (un proyecto de
// Playwright por cliente). Usuarios semilla: ana/1234 (USER) y admin/admin (ADMIN).

test.describe('Sesión', () => {
  for (const [usuario, password] of [
    ['admin', 'admin'],
    ['ana', '1234'],
  ] as const) {
    test(`login correcto de ${usuario}`, async ({ app }) => {
      await app.abrir();
      await app.login(usuario, password);
      await expect(app.tid('listado-tabla')).toBeVisible();
    });
  }

  test('login fallido con contraseña incorrecta', async ({ app }) => {
    await app.abrir();
    await app.abrirLogin();
    await app.enviarLogin('admin', 'contraseña-incorrecta');
    await expect(app.tid('auth-error')).toBeVisible();
    await app.cancelarDialogo();
    await expect(app.tid('menu-sesion')).toContainText('Cuenta');
    await expect(app.tid('menu-sesion')).not.toContainText('admin');
  });

  test('logout cierra la sesión', async ({ app }) => {
    await app.abrir();
    await app.login('ana', '1234');
    await app.logout();
  });
});

test.describe('Registro', () => {
  // El servicio auth guarda los usuarios en memoria y no ofrece borrado: cada
  // ejecución deja cuentas e2e-<timestamp> hasta que se reinicie ese servicio.
  const password = 'e2e-clave-1234';

  test('registro completo y login con la cuenta nueva', async ({ app }) => {
    const usuario = `e2e-${Date.now()}`;
    await app.abrir();
    await app.abrirRegistro();
    await expect(app.tid('auth-password2')).toBeVisible();
    await app.enviarRegistro(usuario, password, password);

    // Tras registrarse se abre el login (sin campo de repetición).
    await expect(app.tid('auth-password2')).toBeHidden();
    await app.enviarLogin(usuario, password);
    await app.esperarSesion(usuario);
  });

  test('registro con contraseñas distintas no crea la cuenta', async ({ app, api }) => {
    const usuario = `e2e-${Date.now()}-x`;
    await app.abrir();
    await app.abrirRegistro();
    await app.enviarRegistro(usuario, password, `${password}-distinta`);
    await expect(app.tid('auth-error')).toBeVisible();
    await app.cancelarDialogo();
    await expect(app.tid('menu-sesion')).toContainText('Cuenta');

    const { status } = await api.intentarLogin(usuario, password);
    expect(status, 'la cuenta no debería existir').not.toBe(200);
  });
});

test.describe('Embalses', () => {
  test('el listado muestra un embalse creado por API', async ({ app, embalse }) => {
    await app.abrir();
    await app.login('ana', '1234');
    await app.irAListado();
    await app.filtrar(embalse.nombre);
    await expect(app.fila(embalse.id)).toBeVisible();
    await expect(app.fila(embalse.id)).toContainText(embalse.nombre);
    await expect(app.fila(embalse.id)).toContainText('100');
  });

  test('admin edita el nivel de un embalse', async ({ app, api, embalse }) => {
    await app.abrir();
    await app.login('admin', 'admin');
    await app.irAListado();
    await app.filtrar(embalse.nombre);
    await app.editarEmbalse(embalse.id);
    await app.escribir(app.tid('form-nivel'), '55');
    await app.tid('form-guardar').click();

    await app.irAListado();
    await app.filtrar(embalse.nombre);
    await expect(app.fila(embalse.id)).toContainText(/100\D*55(\D|$)/); // capacidad 100 y, a continuación, el nivel nuevo
    expect((await api.obtenerEmbalse(embalse.id))?.nivelActualHm3).toBe(55);
  });

  test('admin elimina un embalse', async ({ app, api, embalse }) => {
    await app.abrir();
    await app.login('admin', 'admin');
    await app.irAListado();
    await app.filtrar(embalse.nombre);
    await expect(app.fila(embalse.id)).toBeVisible();
    await app.eliminarEmbalse(embalse.id);

    await expect(app.fila(embalse.id)).toBeHidden();
    expect(await api.obtenerEmbalse(embalse.id)).toBeUndefined();
  });
});
