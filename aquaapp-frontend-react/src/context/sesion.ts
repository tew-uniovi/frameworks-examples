import { createContext, useContext } from 'react'

export interface ValorSesion {
  /** Usuario autenticado (claim "sub" del JWT) o null si no hay sesion. */
  usuario: string | null
  iniciarSesion: (token: string) => void
  cerrarSesion: () => void
}

export const SesionContext = createContext<ValorSesion | null>(null)

export function useSesion(): ValorSesion {
  const valor = useContext(SesionContext)
  if (!valor) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return valor
}
