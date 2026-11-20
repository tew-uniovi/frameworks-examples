import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmbalseService } from './embalse.service';
import { I18nService } from './i18n.service';
import { Embalse } from './modelos';
import { SesionService } from './sesion.service';

export type Vista = 'ninguna' | 'listado' | 'formulario' | 'errorAuth';
export type ModalAuth = 'login' | 'registro';

/**
 * Qué se está viendo (vista de <main> y diálogo de autenticación) y la
 * orquestación entre sesión y embalses: listar, cerrar sesión, 401 y 403.
 * Sin router: la app tiene una sola URL.
 */
@Injectable({ providedIn: 'root' })
export class VistaService {
  private readonly sesion = inject(SesionService);
  private readonly embalses = inject(EmbalseService);
  private readonly i18n = inject(I18nService);
  private readonly snackBar = inject(MatSnackBar);

  readonly vista = signal<Vista>('ninguna');
  /** Diálogo de autenticación abierto (login o registro) o null. */
  readonly modal = signal<ModalAuth | null>(null);
  readonly embalseEnEdicion = signal<Embalse | null>(null);
  /** true cuando la vista actual ya está pintada: se refleja en <body data-listo>. */
  readonly listo = signal(false);

  marcarListo(): void {
    this.listo.set(true);
  }

  private ir(vista: Vista): void {
    this.snackBar.dismiss();
    this.listo.set(false);
    this.vista.set(vista);
  }

  /** Arranque: con token, listado; sin token, login. */
  iniciar(): void {
    if (this.sesion.token()) {
      this.listar();
    } else {
      this.ir('ninguna');
      this.modal.set('login');
    }
  }

  listar(): void {
    this.ir('listado');
    this.embalses.cargar().subscribe({ error: (e: unknown) => this.tratarError(e) });
  }

  mostrarFormulario(embalse: Embalse | null = null): void {
    this.embalseEnEdicion.set(embalse);
    this.ir('formulario');
  }

  abrirModal(modal: ModalAuth): void {
    this.modal.set(modal);
  }

  cerrarModal(): void {
    this.modal.set(null);
  }

  /** Salida voluntaria: sin pantalla de error, directamente al login. */
  cerrarSesion(): void {
    this.sesion.cerrar();
    this.embalses.limpiar();
    this.ir('ninguna');
    this.modal.set('login');
  }

  /** 401 inesperado: se pierde la sesión y se muestra la vista "Sesión no válida". */
  sesionNoValida(): void {
    this.sesion.cerrar();
    this.embalses.limpiar();
    this.modal.set(null);
    this.ir('errorAuth');
  }

  /** Manejo común de errores HTTP de las operaciones protegidas (403 y otros: snackbar). */
  tratarError(error: unknown): void {
    const estado = error instanceof HttpErrorResponse ? error.status : 0;
    if (estado === 401) {
      this.sesionNoValida();
    } else {
      this.avisar(estado === 403 ? 'error.sinPermiso' : 'error.generico');
    }
  }

  private avisar(clave: string): void {
    this.snackBar.open(this.i18n.t(clave), this.i18n.t('comun.cerrar'), { duration: 8000 });
  }
}
