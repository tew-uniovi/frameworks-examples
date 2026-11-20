import { describe, expect, it } from 'vitest'
import type { Embalse } from '../api/tipos'
import { filtrarPorNombre, nivelMedio, paginar } from './listado'

const embalse = (id: number, nombre: string, nivel = 10): Embalse => ({
  id,
  nombre,
  capacidadHm3: 100,
  nivelActualHm3: nivel,
})

const lista = [embalse(1, 'Embalse de Tanes'), embalse(2, 'Embalse de Rioseco'), embalse(3, 'Alfilorios')]

describe('filtro y paginacion', () => {
  it('filtra por nombre sin distinguir mayusculas', () => {
    expect(filtrarPorNombre(lista, 'TANES').map((e) => e.id)).toEqual([1])
    expect(filtrarPorNombre(lista, 'embalse')).toHaveLength(2)
    expect(filtrarPorNombre(lista, '')).toHaveLength(3)
  })

  it('pagina de 5 en 5 y calcula la ultima pagina', () => {
    const doce = Array.from({ length: 12 }, (_, i) => i)
    expect(paginar(doce, 0, 5)).toEqual({ items: [0, 1, 2, 3, 4], pagina: 0, ultimaPagina: 2 })
    expect(paginar(doce, 2, 5).items).toEqual([10, 11])
  })

  it('acota la pagina si se sale del rango (p. ej. tras borrar) y admite listas vacias', () => {
    expect(paginar([1, 2, 3], 7, 5).pagina).toBe(0)
    expect(paginar([], 3, 5)).toEqual({ items: [], pagina: 0, ultimaPagina: 0 })
    expect(paginar([1], -2, 5).pagina).toBe(0)
  })

  it('calcula el nivel medio sobre todos los embalses', () => {
    expect(nivelMedio([embalse(1, 'a', 10), embalse(2, 'b', 30)])).toBe(20)
    expect(nivelMedio([])).toBe(0)
  })
})
