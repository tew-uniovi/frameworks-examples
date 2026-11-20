import { describe, expect, it } from 'vitest'
import { formatearFecha, formatearNumero, idiomaInicial, traducir } from './i18n'

describe('i18n', () => {
  it('prefiere el idioma guardado', () => {
    expect(idiomaInicial('en', 'es-ES')).toBe('en')
    expect(idiomaInicial('es', 'en-US')).toBe('es')
  })

  it('sin idioma guardado (o invalido) usa el del navegador: en -> en, el resto -> es', () => {
    expect(idiomaInicial(null, 'en-GB')).toBe('en')
    expect(idiomaInicial(null, 'fr-FR')).toBe('es')
    expect(idiomaInicial('xx', 'en-US')).toBe('en')
  })

  it('traduce y, si falta la clave, devuelve la propia clave', () => {
    const textos = { 'nav.listado': 'Listado' }
    expect(traducir(textos, 'nav.listado')).toBe('Listado')
    expect(traducir(textos, 'no.existe')).toBe('no.existe')
  })

  it('formatea numeros y fechas segun el idioma (Intl)', () => {
    expect(formatearNumero('es', 1234.5)).toBe(new Intl.NumberFormat('es').format(1234.5))
    expect(formatearNumero('en', 1234.5)).toBe('1,234.5')
    const fecha = new Date(2026, 0, 31, 9, 5)
    expect(formatearFecha('en', fecha)).toContain('1/31/26')
    expect(formatearFecha('es', fecha)).toContain('31/1/26')
  })
})
