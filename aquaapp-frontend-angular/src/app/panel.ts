import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EmbalseService } from './embalse.service';
import { I18nService } from './i18n.service';

/** Panel lateral (<aside>) con los indicadores del listado: nº de embalses y nivel medio. */
@Component({
  selector: 'app-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card appearance="outlined">
      <mat-card-content class="indicadores">
        <p id="panel-total">
          <mat-icon>storage</mat-icon>
          <span>{{ embalses.embalses().length }} {{ i18n.t('panel.embalses') }}</span>
        </p>
        <p id="panel-nivel-medio">
          <mat-icon>show_chart</mat-icon>
          <span>{{ i18n.t('panel.nivelMedio') }}: {{ i18n.numero(embalses.nivelMedio()) }} hm³</span>
        </p>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .indicadores p {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 8px 0;
    }
  `,
})
export class Panel {
  protected readonly i18n = inject(I18nService);
  protected readonly embalses = inject(EmbalseService);
}
