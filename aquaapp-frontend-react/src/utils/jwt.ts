// Utilidades puras para leer el JWT en el cliente (sin verificar la firma:
// eso lo hace el backend; aqui solo se lee "sub" y "exp" por comodidad).
export interface PayloadJwt {
  sub?: string
  exp?: number
}

/** Decodifica el payload (base64url + UTF-8) o devuelve null si el token no es valido. */
export function decodificarPayload(token: string | null): PayloadJwt | null {
  if (!token) return null
  const parte = token.split('.')[1]
  if (!parte) return null
  try {
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/')
    const binario = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
    const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as PayloadJwt
  } catch {
    return null
  }
}

/** Usuario autenticado: claim "sub" del token. */
export function usuarioDeToken(token: string | null): string | null {
  return decodificarPayload(token)?.sub ?? null
}

/** Caducidad local segun el claim "exp" (segundos). Sin token o sin exp se considera caducado. */
export function tokenCaducado(token: string | null, ahora: number = Date.now()): boolean {
  const exp = decodificarPayload(token)?.exp
  if (exp === undefined) return true
  return ahora >= exp * 1000
}
