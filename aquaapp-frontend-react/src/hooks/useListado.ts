import { useMemo, useState } from 'react'
import type { Embalse } from '../api/tipos'
import { filtrarPorNombre, paginar, POR_PAGINA } from '../utils/listado'

/**
 * Filtro por nombre + paginacion del listado. Su estado vive en App, por eso
 * sobrevive a ir al formulario y volver (o a recargar tras una escritura).
 */
export function useListado(embalses: Embalse[]) {
  const [filtro, setFiltro] = useState('')
  const [pagina, setPagina] = useState(0)

  const filtrados = useMemo(() => filtrarPorNombre(embalses, filtro), [embalses, filtro])
  const vista = useMemo(() => paginar(filtrados, pagina, POR_PAGINA), [filtrados, pagina])

  return {
    filtro,
    filtrar: (texto: string) => {
      setFiltro(texto)
      setPagina(0) // el filtro puede dejar menos paginas: volvemos a la primera
    },
    pagina: vista.pagina,
    ultimaPagina: vista.ultimaPagina,
    /** Embalses que cumplen el filtro (todas las paginas). */
    total: filtrados.length,
    visibles: vista.items,
    /** Pagina destino (base 0), tal y como la entrega TablePagination. */
    irAPagina: (destino: number) => setPagina(destino),
  }
}
