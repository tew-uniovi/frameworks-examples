import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from './i18n.service';
import { VistaService } from './vista.service';

/** Vista "Sesión no válida": tras un 401 inesperado (token caducado o rechazado). */
@Component({
  selector: 'app-error-auth',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card appearance="outlined" class="tarjeta">
      <mat-card-header>
        <mat-card-title>{{ i18n.t('login.sesionNoValidaTitle') }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>{{ i18n.t('login.sesionNoValida') }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-flat-button id="btnIrAlLogin" type="button" (click)="vista.abrirModal('login')">
          <mat-icon>login</mat-icon>
          {{ i18n.t('login.irAlLogin') }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .tarjeta {
      max-width: 420px;
      margin: 32px auto 0;
      text-align: center;
    }
    mat-card-header {
      justify-content: center;
    }
    mat-card-actions {
      justify-content: center;
      padding-bottom: 16px;
    }
  `,
})
export class ErrorAuth {
  protected readonly i18n = inject(I18nService);
  protected readonly vista = inject(VistaService);

  constructor() {
    afterNextRender(() => this.vista.marcarListo());
  }
}
