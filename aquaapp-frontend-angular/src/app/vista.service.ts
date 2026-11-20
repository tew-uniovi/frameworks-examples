import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { EmbalseService } from './embalse.service';
import { Embalse } from './modelos';
import { SesionService } from './sesion.service';

export type Vista = 'ninguna' | 'listado' | 'formulario' | 'errorAuth';
export type ModalAuth = 'login' | 'registro';

/**
 * Qué se está viendo (vista de <main> y modal de autenticación) y la
 * orquestación entre sesión y embalses: listar, cerrar sesión, 401 y 403.
 * Sin router: la app tiene una sola URL.
 */
@Injectable({ providedIn: 'root' })
export class VistaService {
  private readonly sesion = inject(SesionService);
  private readonly embalses = inject(EmbalseService);

  readonly vista = signal<Vista>('ninguna');
  readonly modal = signal<ModalAuth | null>(null);
  readonly embalseEnEdicion = signal<Embalse | null>(null);
  /** Clave i18n del aviso de error de <main> (403, errores inesperados). */
  readonly aviso = signal<string | null>(null);
  /** true cuando la vista actual ya está pintada: se refleja en <body data-listo>. */
  readonly listo = signal(false);

  marcarListo(): void {
    this.listo.set(true);
  }

  private ir(vista: Vista): void {
    this.aviso.set(null);
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

  /** Manejo común de errores HTTP de las operaciones protegidas. */
  tratarError(error: unknown): void {
    const estado = error instanceof HttpErrorResponse ? error.status : 0;
    if (estado === 401) {
      this.sesionNoValida();
    } else if (estado === 403) {
      this.aviso.set('error.sinPermiso');
    } else {
      this.aviso.set('error.generico');
    }
  }
}
