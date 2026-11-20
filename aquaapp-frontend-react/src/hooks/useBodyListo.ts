import { useEffect } from 'react'

/**
 * Marca <body data-listo="..."> mientras la vista actual esta pintada. Al cambiar
 * de vista (o dejar de estar lista) el atributo se quita y se vuelve a poner.
 * Lo usan las pruebas y el script de capturas como selector `body[data-listo]`.
 */
export function useBodyListo(listo: boolean, vista: string): void {
  useEffect(() => {
    if (!listo) return
    document.body.dataset.listo = vista
    return () => {
      delete document.body.dataset.listo
    }
  }, [listo, vista])
}
