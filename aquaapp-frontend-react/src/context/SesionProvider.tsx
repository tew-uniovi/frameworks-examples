import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { clearToken, getToken, setToken } from '../api/token'
import { tokenCaducado, usuarioDeToken } from '../utils/jwt'
import { SesionContext, type ValorSesion } from './sesion'

/** Token inicial: el de sessionStorage si sigue vigente; si caduco, se descarta. */
function tokenVigente(): string | null {
  const token = getToken()
  if (token && tokenCaducado(token)) {
    clearToken()
    return null
  }
  return token
}

/** Sesion = JWT en sessionStorage ("jwt"); el usuario sale del claim sub. */
export function SesionProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(tokenVigente)

  const iniciarSesion = useCallback((nuevo: string) => {
    setToken(nuevo)
    setTokenState(nuevo)
  }, [])

  const cerrarSesion = useCallback(() => {
    clearToken()
    setTokenState(null)
  }, [])

  const valor = useMemo<ValorSesion>(
    () => ({ usuario: usuarioDeToken(token), iniciarSesion, cerrarSesion }),
    [token, iniciarSesion, cerrarSesion],
  )

  return <SesionContext value={valor}>{children}</SesionContext>
}
