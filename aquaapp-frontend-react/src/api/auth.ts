import { ErrorApi } from './http'
import type { Credenciales } from './tipos'

// Rutas same-origin: nginx (y el proxy de Vite en desarrollo) quitan el prefijo
// /auth y reenvian al servicio de autenticacion.
async function pedirToken(ruta: '/auth/login' | '/auth/register', credenciales: Credenciales): Promise<string> {
  const resp = await fetch(ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciales),
  })
  if (!resp.ok) throw new ErrorApi(resp.status)
  const { token } = (await resp.json()) as { token: string }
  return token
}

export const login = (credenciales: Credenciales): Promise<string> => pedirToken('/auth/login', credenciales)
export const registrar = (credenciales: Credenciales): Promise<string> => pedirToken('/auth/register', credenciales)
