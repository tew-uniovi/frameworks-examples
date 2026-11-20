import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SesionService } from './sesion.service';

function jwt(payload: object): string {
  return `cabecera.${btoa(JSON.stringify(payload))}.firma`;
}

describe('SesionService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('sin token no hay sesión y se considera caducada', () => {
    const sesion = TestBed.inject(SesionService);
    expect(sesion.haySesion()).toBe(false);
    expect(sesion.usuario()).toBeNull();
    expect(sesion.tokenExpirado()).toBe(true);
  });

  it('login guarda el token en sessionStorage y el usuario sale del claim sub', () => {
    const sesion = TestBed.inject(SesionService);
    const http = TestBed.inject(HttpTestingController);
    const token = jwt({ sub: 'ana', exp: Math.floor(Date.now() / 1000) + 3600 });

    sesion.login({ usuario: 'ana', password: '1234' }).subscribe();
    const peticion = http.expectOne('/auth/login');
    expect(peticion.request.method).toBe('POST');
    peticion.flush({ token });

    expect(sessionStorage.getItem('jwt')).toBe(token);
    expect(sesion.usuario()).toBe('ana');
    expect(sesion.tokenExpirado()).toBe(false);
  });

  it('un token con exp en el pasado está caducado y cerrar() limpia la sesión', () => {
    sessionStorage.setItem('jwt', jwt({ sub: 'ana', exp: 1 }));
    const sesion = TestBed.inject(SesionService);
    expect(sesion.tokenExpirado()).toBe(true);

    sesion.cerrar();
    expect(sessionStorage.getItem('jwt')).toBeNull();
    expect(sesion.haySesion()).toBe(false);
  });
});
