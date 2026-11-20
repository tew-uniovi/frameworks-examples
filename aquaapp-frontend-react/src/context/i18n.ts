import { createContext, useContext } from 'react'
import type { Idioma } from '../utils/i18n'

export interface ValorI18n {
  idioma: Idioma
  setIdioma: (idioma: Idioma) => void
  /** Traduce una clave de i18n/{idioma}.json (si no existe, devuelve la clave). */
  t: (clave: string) => string
  formatoNumero: (valor: number) => string
  formatoFecha: (fecha: Date) => string
}

export const I18nContext = createContext<ValorI18n | null>(null)

export function useI18n(): ValorI18n {
  const valor = useContext(I18nContext)
  if (!valor) throw new Error('useI18n debe usarse dentro de <I18nProvider>')
  return valor
}
