import { tokenCaducado } from '../utils/jwt'
import { clearToken, getToken } from './token'

/** Error HTTP de la API (401 sin sesion valida, 403 sin permiso...). */
export class ErrorApi extends Error {
  status: number

  constructor(status: number, mensaje?: string) {
    super(mensaje ?? `HTTP ${status}`)
    this.name = 'ErrorApi'
    this.status = status
  }
}

/**
 * fetch que adjunta el JWT. Si el token falta o ha caducado se trata como un 401
 * sin llegar a hacer la peticion; cualquier respuesta no 2xx lanza ErrorApi.
 */
export async function apiFetch(url: string, opciones: RequestInit = {}): Promise<Response> {
  const token = getToken()
  if (tokenCaducado(token)) {
    clearToken()
    throw new ErrorApi(401, 'Token ausente o caducado')
  }
  const cabeceras = new Headers(opciones.headers)
  cabeceras.set('Authorization', `Bearer ${token}`)
  cabeceras.set('X-API-Version', '1.0')
  const resp = await fetch(url, { ...opciones, headers: cabeceras })
  if (!resp.ok) throw new ErrorApi(resp.status)
  return resp
}
