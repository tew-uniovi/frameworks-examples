import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injectable,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmbalseService } from './embalse.service';
import { I18nService } from './i18n.service';
import { Embalse } from './modelos';
import { SesionService } from './sesion.service';
import { VistaService } from './vista.service';

/** Etiquetas del paginador de Material traducidas con I18nService ("Página X de Y"). */
@Injectable()
export class PaginadorTraducido extends MatPaginatorIntl {
  private readonly i18n = inject(I18nService);

  constructor() {
    super();
    effect(() => {
      this.i18n.idioma();
      this.actualizarEtiquetas();
    });
    this.actualizarEtiquetas();
  }

  override getRangeLabel = (pagina: number, tamano: number, total: number): string =>
    `${this.i18n.t('listado.pagina')} ${pagina + 1} ${this.i18n.t('listado.de')} ${Math.max(1, Math.ceil(total / tamano))}`;

  private actualizarEtiquetas(): void {
    this.previousPageLabel = this.i18n.t('listado.anterior');
    this.nextPageLabel = this.i18n.t('listado.siguiente');
    this.firstPageLabel = this.i18n.t('listado.primera');
    this.lastPageLabel = this.i18n.t('listado.ultima');
    this.itemsPerPageLabel = this.i18n.t('listado.porPagina');
    this.changes.next();
  }
}

/** Vista de listado: filtro por nombre, tabla paginada (5 por página) y acciones editar/eliminar. */
@Component({
  selector: 'app-listado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: PaginadorTraducido }],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class Listado {
  protected readonly i18n = inject(I18nService);
  protected readonly embalses = inject(EmbalseService);
  private readonly vista = inject(VistaService);
  private readonly sesion = inject(SesionService);

  protected readonly columnas = ['id', 'nombre', 'capacidad', 'nivel', 'acciones'];

  constructor() {
    // Vista pintada: hay datos cargados (ver <body data-listo> en App).
    afterRenderEffect(() => {
      if (this.embalses.cargado()) this.vista.marcarListo();
    });
  }

  protected filtrar(evento: Event): void {
    this.embalses.filtrar((evento.target as HTMLInputElement).value);
  }

  protected cambiarPagina(evento: PageEvent): void {
    this.embalses.ponerPagina(evento.pageIndex);
  }

  protected nuevo(): void {
    this.vista.mostrarFormulario();
  }

  protected editar(embalse: Embalse): void {
    this.vista.mostrarFormulario(embalse);
  }

  protected eliminar(embalse: Embalse): void {
    if (!this.sesion.haySesion() || embalse.id === null) {
      this.vista.abrirModal('login');
      return;
    }
    this.embalses.eliminar(embalse.id).subscribe({
      next: () => this.vista.listar(),
      error: (e: unknown) => this.vista.tratarError(e),
    });
  }
}
