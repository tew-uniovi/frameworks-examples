import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { SesionService } from './sesion.service';

/**
 * Añade "Authorization: Bearer <jwt>" a las peticiones a /api/**. Si el token ha
 * caducado (o no hay), no llega a enviarse nada: se responde con un 401 local,
 * igual que si lo hubiera devuelto el backend.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  const sesion = inject(SesionService);
  if (sesion.tokenExpirado()) {
    return throwError(
      () => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized', url: req.url }),
    );
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${sesion.token()}` } }));
};
