import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { formatearFecha, formatearNumero, idiomaInicial, traducir, type Idioma, type Textos } from '../utils/i18n'
import { I18nContext, type ValorI18n } from './i18n'

async function cargarTextos(idioma: Idioma): Promise<Textos> {
  const resp = await fetch(`${import.meta.env.BASE_URL}i18n/${idioma}.json`)
  if (!resp.ok) throw new Error(`No se pudo cargar i18n/${idioma}.json`)
  return (await resp.json()) as Textos
}

function leerIdiomaGuardado(): string | null {
  try {
    return localStorage.getItem('idioma')
  } catch {
    return null
  }
}

interface Cargado {
  idioma: Idioma
  textos: Textos
}

/** Carga los textos en tiempo de ejecucion y los comparte por Context. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [solicitado, setSolicitado] = useState<Idioma>(() => idiomaInicial(leerIdiomaGuardado(), navigator.language))
  const [cargado, setCargado] = useState<Cargado | null>(null)

  useEffect(() => {
    let cancelado = false
    cargarTextos(solicitado)
      .then((textos) => {
        if (cancelado) return
        setCargado({ idioma: solicitado, textos })
        document.documentElement.lang = solicitado
        const descripcion = textos['app.descripcion']
        if (descripcion) document.querySelector('meta[name="description"]')?.setAttribute('content', descripcion)
        try {
          localStorage.setItem('idioma', solicitado)
        } catch {
          /* almacenamiento no disponible: el idioma solo dura la sesion */
        }
      })
      .catch(console.error)
    return () => {
      cancelado = true
    }
  }, [solicitado])

  const valor = useMemo<ValorI18n | null>(() => {
    if (!cargado) return null
    const { idioma, textos } = cargado
    return {
      idioma,
      setIdioma: setSolicitado,
      t: (clave) => traducir(textos, clave),
      formatoNumero: (n) => formatearNumero(idioma, n),
      formatoFecha: (f) => formatearFecha(idioma, f),
    }
  }, [cargado])

  // Hasta tener los textos no se pinta nada (evita parpadeo con claves en crudo)
  if (!valor) return null
  return <I18nContext value={valor}>{children}</I18nContext>
}
