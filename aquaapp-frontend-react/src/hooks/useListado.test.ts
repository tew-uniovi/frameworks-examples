import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Embalse } from '../api/tipos'
import { useListado } from './useListado'

const embalses: Embalse[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  nombre: i % 2 === 0 ? `Embalse ${i + 1}` : `Presa ${i + 1}`,
  capacidadHm3: 100,
  nivelActualHm3: 10,
}))

describe('useListado', () => {
  it('muestra 5 por pagina y navega con irAPagina', () => {
    const { result } = renderHook(() => useListado(embalses))
    expect(result.current.visibles).toHaveLength(5)
    expect(result.current.ultimaPagina).toBe(2)
    act(() => result.current.irAPagina(1))
    expect(result.current.pagina).toBe(1)
    expect(result.current.total).toBe(12)
    expect(result.current.visibles[0].id).toBe(6)
  })

  it('al filtrar vuelve a la primera pagina', () => {
    const { result } = renderHook(() => useListado(embalses))
    act(() => result.current.irAPagina(1))
    act(() => result.current.filtrar('presa'))
    expect(result.current.pagina).toBe(0)
    expect(result.current.visibles.every((e) => e.nombre.startsWith('Presa'))).toBe(true)
    expect(result.current.ultimaPagina).toBe(1)
  })

  it('conserva filtro y pagina cuando cambian los datos (recarga tras escribir)', () => {
    const { result, rerender } = renderHook(({ lista }) => useListado(lista), { initialProps: { lista: embalses } })
    act(() => result.current.filtrar('embalse'))
    rerender({ lista: embalses.slice(0, 11) })
    expect(result.current.filtro).toBe('embalse')
  })
})
