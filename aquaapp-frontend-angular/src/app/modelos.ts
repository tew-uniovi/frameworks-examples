/** Forma del JSON que devuelve /api/embalses. */
export interface Embalse {
  id: number | null;
  nombre: string;
  capacidadHm3: number;
  nivelActualHm3: number;
}

/** Credenciales para /auth/login y /auth/register. */
export interface Credenciales {
  usuario: string;
  password: string;
}

/** Respuesta del servicio de autenticación. */
export interface RespuestaToken {
  token: string;
}
