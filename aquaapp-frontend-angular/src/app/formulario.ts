import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { EmbalseService } from './embalse.service';
import { I18nService } from './i18n.service';
import { Embalse } from './modelos';
import { SesionService } from './sesion.service';
import { VistaService } from './vista.service';

/** Error de validación: el nivel actual no puede superar la capacidad del embalse. */
function nivelNoSuperaCapacidad(nivel: AbstractControl): ValidationErrors | null {
  const capacidad = nivel.parent?.get('capacidadHm3')?.value as number | null | undefined;
  const valor = nivel.value as number | null;
  return valor !== null && capacidad != null && valor > capacidad
    ? { superaCapacidad: true }
    : null;
}

/** Formulario de alta y edición (incrustado en <main>, no es un diálogo). */
@Component({
  selector: 'app-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario {
  protected readonly i18n = inject(I18nService);
  private readonly embalses = inject(EmbalseService);
  private readonly sesion = inject(SesionService);
  private readonly vista = inject(VistaService);

  protected readonly guardando = signal(false);
  /** Id del embalse en edición ("" si es un alta): distingue el alta de la edición. */
  protected readonly id = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', Validators.required],
    capacidadHm3: [null as number | null, [Validators.required, Validators.min(0)]],
    nivelActualHm3: [
      null as number | null,
      [Validators.required, Validators.min(0), nivelNoSuperaCapacidad],
    ],
  });

  constructor() {
    const embalse = this.vista.embalseEnEdicion();
    if (embalse) {
      this.id.set(String(embalse.id ?? ''));
      this.form.patchValue(embalse);
    }
    // Si cambia la capacidad hay que volver a comprobar el nivel
    this.form.controls.capacidadHm3.valueChanges.subscribe(() =>
      this.form.controls.nivelActualHm3.updateValueAndValidity(),
    );
    afterNextRender(() => this.vista.marcarListo());
  }

  protected cancelar(): void {
    this.vista.listar();
  }

  protected guardar(): void {
    if (!this.sesion.haySesion()) {
      this.vista.abrirModal('login');
      return;
    }
    if (this.form.invalid) return; // los mat-error se muestran solos al enviar
    const { nombre, capacidadHm3, nivelActualHm3 } = this.form.getRawValue();
    const embalse: Embalse = {
      id: this.id() ? Number(this.id()) : null,
      nombre,
      capacidadHm3: capacidadHm3 ?? 0,
      nivelActualHm3: nivelActualHm3 ?? 0,
    };
    this.guardando.set(true);
    (embalse.id ? this.embalses.actualizar(embalse) : this.embalses.crear(embalse))
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => this.vista.listar(),
        error: (e: unknown) => this.vista.tratarError(e),
      });
  }
}
