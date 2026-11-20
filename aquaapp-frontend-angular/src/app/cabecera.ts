import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map } from 'rxjs';
import { I18nService, Idioma } from './i18n.service';
import { SesionService } from './sesion.service';
import { VistaService } from './vista.service';

/** Barra superior: logo, menú Embalses, menú de cuenta (saludo) y selector de idioma. */
@Component({
  selector: 'app-cabecera',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './cabecera.html',
  styleUrl: './cabecera.css',
})
export class Cabecera {
  protected readonly i18n = inject(I18nService);
  protected readonly sesion = inject(SesionService);
  protected readonly vista = inject(VistaService);

  /** En pantallas estrechas los menús se quedan solo con el icono (y entonces llevan tooltip). */
  protected readonly compacto = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 599.98px)')
      .pipe(map((estado) => estado.matches)),
    { initialValue: false },
  );

  /** Rótulo del menú de sesión: "Hola, usuario" con sesión; "Cuenta" sin ella. */
  protected readonly saludo = computed(() => {
    const usuario = this.sesion.usuario();
    return usuario ? `${this.i18n.t('nav.hola')}, ${usuario}` : this.i18n.t('nav.cuenta');
  });

  protected cambiarIdioma(idioma: Idioma): void {
    void this.i18n.cargar(idioma);
  }
}
