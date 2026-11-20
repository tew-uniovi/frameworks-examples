import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { I18nService } from './i18n.service';
import { SesionService } from './sesion.service';
import { VistaService } from './vista.service';

function passwordsIguales(repetida: AbstractControl): ValidationErrors | null {
  const password = repetida.parent?.get('password')?.value as string | undefined;
  return password === undefined || repetida.value === password ? null : { noCoinciden: true };
}

/**
 * Contenido del diálogo de autenticación (MatDialog). Login y registro
 * comparten el mismo diálogo: el modo lo marca VistaService.modal().
 */
@Component({
  selector: 'app-auth-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './auth-dialog.html',
  styleUrl: './auth-dialog.css',
})
export class AuthDialog {
  protected readonly i18n = inject(I18nService);
  protected readonly vista = inject(VistaService);
  private readonly sesion = inject(SesionService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly formLogin = this.fb.group({
    usuario: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected readonly formRegistro = this.fb.group({
    usuario: ['', Validators.required],
    password: ['', Validators.required],
    password2: ['', [Validators.required, passwordsIguales]],
  });

  protected readonly cargando = signal(false);
  /** Clave i18n del error del servidor (se guarda la clave para que siga el idioma). */
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Si cambia la contraseña hay que volver a comprobar que la repetición coincida
    this.formRegistro.controls.password.valueChanges.subscribe(() =>
      this.formRegistro.controls.password2.updateValueAndValidity(),
    );

  }

  /** Pasa de login a registro (o al revés) partiendo de un formulario limpio. */
  protected cambiarA(modo: 'login' | 'registro'): void {
    this.formLogin.reset();
    this.formRegistro.reset();
    this.error.set(null);
    this.vista.abrirModal(modo);
  }

  protected login(): void {
    if (this.formLogin.invalid) return;
    this.cargando.set(true);
    this.error.set(null);
    this.sesion
      .login(this.formLogin.getRawValue())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => {
          this.vista.cerrarModal();
          this.vista.listar(); // ya autenticado: se muestra el listado
        },
        error: () => this.error.set('login.errorCredenciales'),
      });
  }

  protected registrar(): void {
    if (this.formRegistro.invalid) return;
    const { usuario, password } = this.formRegistro.getRawValue();
    this.cargando.set(true);
    this.error.set(null);
    this.sesion
      .registrar({ usuario, password })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => this.vista.abrirModal('login'), // cuenta creada: ahora, a iniciar sesión
        error: () => this.error.set('login.errorRegistro'),
      });
  }
}
