import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Embalse } from './modelos';

const URL_API = '/api/embalses';

/** CRUD de embalses contra /api/embalses y estado del listado (datos, filtro y página). */
@Injectable({ providedIn: 'root' })
export class EmbalseService {
  private readonly http = inject(HttpClient);

  readonly porPagina = 5;

  readonly embalses = signal<Embalse[]>([]);
  readonly cargado = signal(false);
  readonly actualizado = signal<Date | null>(null);
  readonly filtro = signal('');
  readonly pagina = signal(0);

  readonly filtrados = computed(() => {
    const texto = this.filtro().toLowerCase();
    return this.embalses().filter((e) => e.nombre.toLowerCase().includes(texto));
  });
  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.filtrados().length / this.porPagina)),
  );
  readonly paginaActual = computed(() => {
    const inicio = this.pagina() * this.porPagina;
    return this.filtrados().slice(inicio, inicio + this.porPagina);
  });
  /** Indicador del panel lateral: se calcula sobre TODOS los embalses, no sobre la página. */
  readonly nivelMedio = computed(() => {
    const todos = this.embalses();
    return todos.length ? todos.reduce((suma, e) => suma + e.nivelActualHm3, 0) / todos.length : 0;
  });

  /** GET: recarga el listado conservando filtro y página (ajustando la página si ya no existe). */
  cargar(): Observable<Embalse[]> {
    this.cargado.set(false);
    return this.http.get<Embalse[]>(URL_API).pipe(
      tap({
        next: (embalses) => {
          this.embalses.set(embalses);
          this.actualizado.set(new Date());
          this.pagina.update((p) => Math.min(p, this.totalPaginas() - 1));
          this.cargado.set(true);
        },
        error: () => {
          this.embalses.set([]);
          this.cargado.set(true);
        },
      }),
    );
  }

  crear(embalse: Embalse): Observable<Embalse> {
    return this.http.post<Embalse>(URL_API, embalse);
  }

  actualizar(embalse: Embalse): Observable<Embalse> {
    return this.http.put<Embalse>(`${URL_API}/${embalse.id}`, embalse);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${URL_API}/${id}`);
  }

  filtrar(texto: string): void {
    this.filtro.set(texto);
    this.pagina.set(0); // el filtro puede dejar menos páginas: se vuelve a la primera
  }

  irAPagina(delta: number): void {
    this.pagina.update((p) => Math.min(Math.max(p + delta, 0), this.totalPaginas() - 1));
  }

  /** Olvida los datos (al cerrar sesión o perderla). */
  limpiar(): void {
    this.embalses.set([]);
    this.cargado.set(false);
    this.actualizado.set(null);
    this.filtro.set('');
    this.pagina.set(0);
  }
}
