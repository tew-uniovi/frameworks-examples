import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Credenciales, RespuestaToken } from './modelos';

const CLAVE_JWT = 'jwt';

interface PayloadJwt {
  sub?: string;
  exp?: number;
}

/** Sesión del usuario: JWT en sessionStorage, usuario = claim "sub", caducidad = claim "exp". */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(this.leerToken());
  readonly usuario = computed(() => this.payload(this.token())?.sub ?? null);
  readonly haySesion = computed(() => this.usuario() !== null);

  /** POST /auth/login: guarda el token recibido. */
  login(credenciales: Credenciales): Observable<void> {
    return this.http.post<RespuestaToken>('/auth/login', credenciales).pipe(
      tap((respuesta) => this.guardar(respuesta.token)),
      map(() => undefined),
    );
  }

  /** POST /auth/register: crea la cuenta (el token que devuelve no se usa: después se pide el login). */
  registrar(credenciales: Credenciales): Observable<void> {
    return this.http
      .post<RespuestaToken>('/auth/register', credenciales)
      .pipe(map(() => undefined));
  }

  cerrar(): void {
    try {
      sessionStorage.removeItem(CLAVE_JWT);
    } catch {
      // nada que borrar
    }
    this.token.set(null);
  }

  /** Sin token, o con el claim "exp" ya superado, la sesión se considera caducada. */
  tokenExpirado(): boolean {
    const exp = this.payload(this.token())?.exp;
    return exp === undefined || Date.now() >= exp * 1000;
  }

  private guardar(token: string): void {
    try {
      sessionStorage.setItem(CLAVE_JWT, token);
    } catch {
      // se mantiene solo en memoria
    }
    this.token.set(token);
  }

  private leerToken(): string | null {
    try {
      return sessionStorage.getItem(CLAVE_JWT);
    } catch {
      return null;
    }
  }

  private payload(token: string | null): PayloadJwt | null {
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes)) as PayloadJwt;
    } catch {
      return null;
    }
  }
}
