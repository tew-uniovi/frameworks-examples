import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page object común a los tres clientes. Solo usa getByTestId(): el atributo
 * concreto (data-testid o flt-semantics-identifier) lo fija la config por proyecto.
 */
export class Aquaapp {
  constructor(readonly page: Page) {}

  tid(id: string): Locator {
    return this.page.getByTestId(id);
  }

  /** Espera n fotogramas de animación (sin sleeps fijos): da tiempo a Flutter a procesar el foco. */
  private async esperarFotogramas(n: number): Promise<void> {
    await this.page.evaluate(
      (n) =>
        new Promise<void>((resolve) => {
          let i = 0;
          const paso = () => (++i >= n ? resolve() : requestAnimationFrame(paso));
          paso();
        }),
      n,
    );
  }

  /**
   * Escribe en un campo de forma fiable en los tres frameworks. Se da foco con un click
   * (si algo lo intercepta, p. ej. la etiqueta flotante de Angular Material sobre un campo
   * vacío, se enfoca el elemento directamente) y se rellena el input enfocado.
   *
   * Flutter Web necesita unos fotogramas tras el foco para sincronizar el campo: lo que se
   * escribe antes se pierde o se trunca (y Control+A + Borrar tampoco es fiable). Por eso
   * se espera ese margen y se comprueba el valor, reintentando todo el bloque si no coincide.
   */
  async escribir(campo: Locator, texto: string): Promise<void> {
    await expect(campo).toBeVisible();
    await expect(async () => {
      await campo.click({ timeout: 3_000 }).catch(() => campo.focus());
      await this.esperarFotogramas(4);
      const enfocado = this.page.locator(':focus');
      await enfocado.fill(texto, { timeout: 3_000 });
      await this.esperarFotogramas(4);
      await expect(enfocado).toHaveValue(texto, { timeout: 1_000 });
    }).toPass({ timeout: 25_000 });
  }

  /**
   * Carga la aplicación. Los tres clientes abren solos el diálogo de login cuando
   * no hay sesión: se cierra con «Cancelar» para partir de un estado conocido.
   */
  async abrir(): Promise<void> {
    await this.page.goto('./');
    await expect(this.tid('auth-dialogo')).toBeVisible();
    await this.cancelarDialogo();
    await expect(this.tid('menu-sesion')).toBeVisible();
  }

  // --- Sesión --------------------------------------------------------------

  /** Abre el diálogo de login desde el menú de cuenta. */
  async abrirLogin(): Promise<void> {
    await this.tid('menu-sesion').click();
    await this.tid('menu-login').click();
    await expect(this.tid('auth-dialogo')).toBeVisible();
  }

  /** Abre el diálogo de registro desde el menú de cuenta. */
  async abrirRegistro(): Promise<void> {
    await this.tid('menu-sesion').click();
    await this.tid('menu-registro').click();
    await expect(this.tid('auth-dialogo')).toBeVisible();
  }

  /** Rellena el diálogo de login y lo envía (no espera el resultado). */
  async enviarLogin(usuario: string, password: string): Promise<void> {
    await this.escribir(this.tid('auth-usuario'), usuario);
    await this.escribir(this.tid('auth-password'), password);
    await this.tid('auth-enviar').click();
  }

  /** Rellena el diálogo de registro y lo envía (no espera el resultado). */
  async enviarRegistro(usuario: string, password: string, repetida: string): Promise<void> {
    await this.escribir(this.tid('auth-usuario'), usuario);
    await this.escribir(this.tid('auth-password'), password);
    await this.escribir(this.tid('auth-password2'), repetida);
    await this.tid('auth-enviar').click();
  }

  /** Login completo con credenciales válidas: espera a que la sesión quede iniciada. */
  async login(usuario: string, password: string): Promise<void> {
    await this.abrirLogin();
    await this.enviarLogin(usuario, password);
    await this.esperarSesion(usuario);
  }

  async esperarSesion(usuario: string): Promise<void> {
    await expect(this.tid('auth-dialogo')).toBeHidden();
    await expect(this.tid('menu-sesion')).toContainText(usuario);
  }

  async logout(): Promise<void> {
    await this.tid('menu-sesion').click();
    await this.tid('menu-logout').click();
    // Sin sesión, la aplicación vuelve a pedir el login.
    await expect(this.tid('auth-dialogo')).toBeVisible();
    await this.cancelarDialogo();
    await expect(this.tid('menu-sesion')).toContainText('Cuenta');
  }

  /** Cierra el diálogo de acceso con «Cancelar» (con el diálogo abierto, el menú queda tapado por el modal). */
  async cancelarDialogo(): Promise<void> {
    await this.tid('auth-cancelar').click();
    await expect(this.tid('auth-dialogo')).toBeHidden();
  }

  // --- Listado -------------------------------------------------------------

  async irAListado(): Promise<void> {
    await this.tid('menu-embalses').click();
    await this.tid('menu-listado').click();
    await expect(this.tid('listado-tabla')).toBeVisible();
  }

  /** Filtra por nombre para que el embalse buscado quede en la primera página (se pagina de 5 en 5). */
  async filtrar(texto: string): Promise<void> {
    await this.escribir(this.tid('listado-filtro'), texto);
  }

  fila(id: number): Locator {
    return this.tid(`fila-embalse-${id}`);
  }

  async editarEmbalse(id: number): Promise<void> {
    await this.tid(`editar-embalse-${id}`).click();
    await expect(this.tid('form-nivel')).toBeVisible();
  }

  async eliminarEmbalse(id: number): Promise<void> {
    await this.tid(`eliminar-embalse-${id}`).click();
  }
}
