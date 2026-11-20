export type Idioma = 'es' | 'en'
export type Textos = Record<string, string>

export const IDIOMAS: readonly Idioma[] = ['es', 'en']

export function esIdioma(valor: string | null): valor is Idioma {
  return valor === 'es' || valor === 'en'
}

/** Idioma guardado en localStorage o, si no hay, el del navegador (en -> en, resto -> es). */
export function idiomaInicial(guardado: string | null, idiomaNavegador: string): Idioma {
  if (esIdioma(guardado)) return guardado
  return idiomaNavegador.toLowerCase().startsWith('en') ? 'en' : 'es'
}

/** Traduce una clave; si no existe devuelve la propia clave. */
export function traducir(textos: Textos, clave: string): string {
  return textos[clave] || clave
}

export function formatearNumero(idioma: Idioma, valor: number): string {
  return new Intl.NumberFormat(idioma).format(valor)
}

export function formatearFecha(idioma: Idioma, fecha: Date): string {
  return new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(fecha)
}
