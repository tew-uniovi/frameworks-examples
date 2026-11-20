import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthDialog } from './auth-dialog';
import { Cabecera } from './cabecera';
import { EmbalseService } from './embalse.service';
import { ErrorAuth } from './error-auth';
import { Formulario } from './formulario';
import { I18nService } from './i18n.service';
import { Listado } from './listado';
import { Panel } from './panel';
import { VistaService } from './vista.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Cabecera, Listado, Formulario, ErrorAuth, Panel],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly i18n = inject(I18nService);
  protected readonly vista = inject(VistaService);
  protected readonly embalses = inject(EmbalseService);
  private readonly dialogo = inject(MatDialog);
  private readonly documento = inject(DOCUMENT);

  private dialogoAuth: MatDialogRef<AuthDialog> | null = null;

  constructor() {
    // <body data-listo> indica que la vista actual ya está pintada (lo usa el script de capturas)
    effect(() => {
      this.documento.body.toggleAttribute('data-listo', this.vista.listo());
    });

    // El diálogo de autenticación sigue a VistaService.modal()
    effect(() => {
      const modal = this.vista.modal();
      untracked(() => (modal ? this.abrirDialogo() : this.dialogoAuth?.close()));
    });

    this.vista.iniciar();
  }

  private abrirDialogo(): void {
    if (this.dialogoAuth) return; // ya abierto: solo cambia el modo (login/registro)
    const ref = this.dialogo.open(AuthDialog, {
      id: 'modalAuth',
      width: '420px',
      maxWidth: '92vw',
      autoFocus: 'first-tabbable',
    });
    this.dialogoAuth = ref;
    ref.afterOpened().subscribe(() => this.vista.marcarListo());
    ref.afterClosed().subscribe(() => {
      this.dialogoAuth = null;
      this.vista.cerrarModal(); // también si se cierra con Esc o clic fuera
    });
  }
}
