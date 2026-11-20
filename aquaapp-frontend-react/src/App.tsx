import { useCallback, useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { ErrorApi } from './api/http'
import type { Embalse } from './api/tipos'
import { BarraNavegacion } from './components/BarraNavegacion'
import { DialogoAuth, type ModoAuth } from './components/DialogoAuth'
import { PanelIndicadores } from './components/PanelIndicadores'
import { useI18n } from './context/i18n'
import { useSesion } from './context/sesion'
import { useBodyListo } from './hooks/useBodyListo'
import { useEmbalses } from './hooks/useEmbalses'
import { useListado } from './hooks/useListado'
import { ErrorAuthView } from './views/ErrorAuthView'
import { FormularioView } from './views/FormularioView'
import { ListadoView } from './views/ListadoView'

// "vacia": sin sesion todavia (solo se ve el modal de login)
type Vista = 'vacia' | 'listado' | 'formulario' | 'errorAuth'

export default function App() {
  const { t } = useI18n()
  const { usuario, iniciarSesion, cerrarSesion } = useSesion()
  // Si hay sesion al arrancar, el listado empieza ya en "cargando" (sin pintar un instante la lista vacia)
  const [arranqueConSesion] = useState(usuario !== null)
  const datos = useEmbalses(arranqueConSesion)
  const listado = useListado(datos.embalses)

  const [vista, setVista] = useState<Vista>(usuario ? 'listado' : 'vacia')
  const [modal, setModal] = useState<ModoAuth | null>(usuario ? null : 'login')
  const [enEdicion, setEnEdicion] = useState<Embalse | null>(null)
  // Clave i18n del aviso de error (403, red...) y si el Snackbar esta abierto
  const [aviso, setAviso] = useState('')
  const [avisoAbierto, setAvisoAbierto] = useState(false)

  /** 401 inesperado -> sesion limpia y vista "Sesion no valida"; 403 -> aviso de permisos. */
  const gestionarError = useCallback(
    (error: unknown) => {
      if (error instanceof ErrorApi && error.status === 401) {
        cerrarSesion()
        setModal(null)
        setVista('errorAuth')
        return
      }
      setAviso(error instanceof ErrorApi && error.status === 403 ? 'error.sinPermiso' : 'error.servidor')
      setAvisoAbierto(true)
    },
    [cerrarSesion],
  )

  const { recargar } = datos
  const irAListado = useCallback(() => {
    setVista('listado')
    setAvisoAbierto(false)
    recargar().catch(gestionarError) // el filtro y la pagina se conservan (viven en useListado)
  }, [recargar, gestionarError])

  // Con token al arrancar -> listado (sin token, el modal de login ya esta abierto)
  useEffect(() => {
    if (arranqueConSesion) recargar().catch(gestionarError)
  }, [arranqueConSesion, recargar, gestionarError])

  function irAAlta() {
    setEnEdicion(null)
    setAvisoAbierto(false)
    setVista('formulario')
  }

  function irAEdicion(embalse: Embalse) {
    setEnEdicion(embalse)
    setAvisoAbierto(false)
    setVista('formulario')
  }

  function alIniciarSesion(token: string) {
    iniciarSesion(token)
    setModal(null)
    irAListado()
  }

  function salir() {
    // Cierre voluntario: sin pantalla de error
    cerrarSesion()
    setVista('vacia')
    setModal('login')
  }

  async function guardar(embalse: Embalse) {
    if (!usuario) {
      setModal('login')
      throw new Error('Sin sesion')
    }
    try {
      await datos.guardar(embalse)
    } catch (error) {
      gestionarError(error)
      throw error
    }
    irAListado() // tras escribir, recargar conservando filtro y pagina
  }

  async function eliminar(embalse: Embalse) {
    if (!usuario) {
      setModal('login')
      return
    }
    if (embalse.id === null) return
    try {
      await datos.eliminar(embalse.id)
    } catch (error) {
      gestionarError(error)
      return
    }
    irAListado()
  }

  const listo = vista !== 'listado' || !datos.cargando
  useBodyListo(listo, vista)

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BarraNavegacion
        onListado={irAListado}
        onAlta={irAAlta}
        onLogin={() => setModal('login')}
        onRegistro={() => setModal('registro')}
        onLogout={salir}
      />

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'flex-start' },
          gap: 3,
          p: 3,
        }}
      >
        <Box component="main" sx={{ flex: { md: 1 }, minWidth: 0, width: '100%' }}>
          {vista === 'listado' && (
            <ListadoView
              visibles={listado.visibles}
              cargando={datos.cargando}
              ultimaActualizacion={datos.ultimaActualizacion}
              filtro={listado.filtro}
              onFiltrar={listado.filtrar}
              pagina={listado.pagina}
              ultimaPagina={listado.ultimaPagina}
              onIrAPagina={listado.irAPagina}
              onEditar={irAEdicion}
              onEliminar={eliminar}
            />
          )}
          {vista === 'formulario' && <FormularioView key={enEdicion?.id ?? 'nuevo'} embalse={enEdicion} onGuardar={guardar} />}
          {vista === 'errorAuth' && <ErrorAuthView onIrAlLogin={() => setModal('login')} />}
        </Box>
        <Box component="aside" sx={{ width: { xs: '100%', md: 260 }, flexShrink: 0 }}>
          {vista === 'listado' && <PanelIndicadores embalses={datos.embalses} />}
        </Box>
      </Box>

      <Typography component="footer" variant="body2" color="text.secondary" align="center" sx={{ p: 3 }}>
        {t('footer')}
      </Typography>

      <DialogoAuth
        modo={modal}
        onCerrar={() => setModal(null)}
        onCambiarModo={setModal}
        onLoginCorrecto={alIniciarSesion}
      />

      <Snackbar
        open={avisoAbierto}
        autoHideDuration={6000}
        onClose={(_, motivo) => motivo !== 'clickaway' && setAvisoAbierto(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert id="mensaje-error" severity="error" variant="filled" onClose={() => setAvisoAbierto(false)}>
          {t(aviso)}
        </Alert>
      </Snackbar>
    </Box>
  )
}
