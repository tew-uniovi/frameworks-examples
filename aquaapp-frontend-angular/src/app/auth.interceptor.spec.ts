import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth.interceptor';

function jwt(exp: number): string {
  return `h.${btoa(JSON.stringify({ sub: 'ana', exp }))}.f`;
}

describe('authInterceptor', () => {
  let http: HttpClient;
  let controlador: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controlador = TestBed.inject(HttpTestingController);
  });

  it('añade la cabecera Bearer a /api/** cuando el token es válido', () => {
    const token = jwt(Math.floor(Date.now() / 1000) + 3600);
    sessionStorage.setItem('jwt', token);
    http.get('/api/embalses').subscribe();
    const req = controlador.expectOne('/api/embalses');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('con el token caducado responde 401 sin enviar la petición', () => {
    sessionStorage.setItem('jwt', jwt(1));
    let estado = 0;
    http.get('/api/embalses').subscribe({ error: (e: { status: number }) => (estado = e.status) });
    controlador.expectNone('/api/embalses');
    expect(estado).toBe(401);
  });

  it('no toca las peticiones que no son de /api/', () => {
    http.get('/auth/login').subscribe();
    const req = controlador.expectOne('/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
  });
});
