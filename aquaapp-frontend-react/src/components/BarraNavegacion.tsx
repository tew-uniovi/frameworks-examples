import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AddIcon from '@mui/icons-material/Add'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import TranslateIcon from '@mui/icons-material/Translate'
import ViewListIcon from '@mui/icons-material/ViewList'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import logo from '../assets/aquaapp-logo-horizontal.svg'
import { useI18n } from '../context/i18n'
import { useSesion } from '../context/sesion'
import { MenuBoton } from './MenuBoton'

interface Props {
  onListado: () => void
  onAlta: () => void
  onLogin: () => void
  onRegistro: () => void
  onLogout: () => void
}

/** AppBar con los menus Embalses (solo con sesion), Cuenta e Idioma. */
export function BarraNavegacion({ onListado, onAlta, onLogin, onRegistro, onLogout }: Props) {
  const { t, idioma, setIdioma } = useI18n()
  const { usuario } = useSesion()
  const conSesion = usuario !== null

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar>
        <Box
          component="a"
          href="#"
          aria-label="aquaapp"
          sx={(theme) => ({
            display: 'flex',
            mr: 2,
            borderRadius: 1,
            px: 1,
            // el logo es azul oscuro: en modo oscuro se apoya sobre una pastilla clara
            ...theme.applyStyles('dark', { bgcolor: 'common.white' }),
          })}
        >
          <Box component="img" src={logo} alt="aquaapp" sx={{ height: (theme) => theme.spacing(5) }} />
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          {conSesion && (
            <MenuBoton
              id="menuEmbalses"
              icono={<WaterDropIcon />}
              etiqueta={t('nav.embalses')}
              ariaLabel={t('nav.embalses')}
            >
              <MenuItem id="btnListado" onClick={onListado}>
                <ListItemIcon>
                  <ViewListIcon fontSize="small" />
                </ListItemIcon>
                {t('nav.listado')}
              </MenuItem>
              <MenuItem id="btnAlta" onClick={onAlta}>
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                {t('nav.nuevo')}
              </MenuItem>
            </MenuBoton>
          )}
        </Box>

        <MenuBoton
          id="menuSesion"
          alinearDerecha
          icono={<AccountCircleIcon />}
          etiqueta={<span id="saludo">{usuario ? `${t('nav.hola')}, ${usuario}` : t('nav.cuenta')}</span>}
          ariaLabel={usuario ? `${t('nav.hola')}, ${usuario}` : t('nav.cuenta')}
        >
          {conSesion ? (
            <MenuItem id="btnLogout" onClick={onLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              {t('nav.salir')}
            </MenuItem>
          ) : (
            [
              <MenuItem key="login" id="btnMenuLogin" onClick={onLogin}>
                <ListItemIcon>
                  <LoginIcon fontSize="small" />
                </ListItemIcon>
                {t('login.title')}
              </MenuItem>,
              <MenuItem key="registro" id="btnMenuRegistro" onClick={onRegistro}>
                <ListItemIcon>
                  <PersonAddIcon fontSize="small" />
                </ListItemIcon>
                {t('login.registrate')}
              </MenuItem>,
            ]
          )}
        </MenuBoton>

        <MenuBoton
          id="menuIdioma"
          alinearDerecha
          icono={<TranslateIcon />}
          etiqueta={<span id="idiomaActivo">{idioma.toUpperCase()}</span>}
          ariaLabel={`${t('nav.idioma')}: ${idioma.toUpperCase()}`}
        >
          <MenuItem data-idioma="es" selected={idioma === 'es'} onClick={() => setIdioma('es')}>
            ES · Español
          </MenuItem>
          <MenuItem data-idioma="en" selected={idioma === 'en'} onClick={() => setIdioma('en')}>
            EN · English
          </MenuItem>
        </MenuBoton>
      </Toolbar>
    </AppBar>
  )
}
