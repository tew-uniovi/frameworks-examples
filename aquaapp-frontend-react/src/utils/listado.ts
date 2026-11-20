import type { Embalse } from '../api/tipos'

export const POR_PAGINA = 5

/** Filtra por nombre (sin distinguir mayusculas). */
export function filtrarPorNombre(embalses: Embalse[], filtro: string): Embalse[] {
  const texto = filtro.toLowerCase()
  return embalses.filter((e) => e.nombre.toLowerCase().includes(texto))
}

export interface Pagina<T> {
  items: T[]
  /** Pagina efectiva (base 0), acotada al rango valido. */
  pagina: number
  ultimaPagina: number
}

/** Pagina una lista. Si la pagina pedida se sale del rango (p. ej. tras borrar), se acota. */
export function paginar<T>(lista: T[], pagina: number, porPagina: number = POR_PAGINA): Pagina<T> {
  const ultimaPagina = Math.max(0, Math.ceil(lista.length / porPagina) - 1)
  const efectiva = Math.min(Math.max(0, pagina), ultimaPagina)
  const inicio = efectiva * porPagina
  return { items: lista.slice(inicio, inicio + porPagina), pagina: efectiva, ultimaPagina }
}

export function nivelMedio(embalses: Embalse[]): number {
  if (embalses.length === 0) return 0
  return embalses.reduce((suma, e) => suma + e.nivelActualHm3, 0) / embalses.length
}
