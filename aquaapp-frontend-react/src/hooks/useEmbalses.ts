import { useCallback, useState } from 'react'
import { actualizarEmbalse, crearEmbalse, eliminarEmbalse, listarEmbalses } from '../api/embalses'
import type { Embalse } from '../api/tipos'

/**
 * Datos de embalses y operaciones CRUD. Los errores (ErrorApi, de red...) se
 * propagan a quien llama, que decide como mostrarlos (401 -> sesion no valida,
 * 403 -> aviso de permisos...).
 */
export function useEmbalses() {
  const [embalses, setEmbalses] = useState<Embalse[]>([])
  const [cargando, setCargando] = useState(false)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    try {
      setEmbalses(await listarEmbalses())
      setUltimaActualizacion(new Date())
    } catch (error) {
      setEmbalses([])
      throw error
    } finally {
      setCargando(false)
    }
  }, [])

  const guardar = useCallback((embalse: Embalse) => (embalse.id ? actualizarEmbalse(embalse) : crearEmbalse(embalse)), [])

  const eliminar = useCallback((id: number) => eliminarEmbalse(id), [])

  return { embalses, cargando, ultimaActualizacion, recargar, guardar, eliminar }
}
