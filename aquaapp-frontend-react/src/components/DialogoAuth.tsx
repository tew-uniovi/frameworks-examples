import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { login, registrar } from '../api/auth'
import { ErrorApi } from '../api/http'
import { useI18n } from '../context/i18n'

export type ModoAuth = 'login' | 'registro'

interface Props {
  /** null = cerrado. Login y registro comparten el mismo Dialog. */
  modo: ModoAuth | null
  onCerrar: () => void
  onCambiarModo: (modo: ModoAuth) => void
  /** Login correcto: recibe el JWT. */
  onLoginCorrecto: (token: string) => void
}

export function DialogoAuth({ modo, onCerrar, onCambiarModo, onLoginCorrecto }: Props) {
  // Durante la animacion de cierre `modo` ya es null: se recuerda el ultimo para no vaciar el contenido
  const [ultimo, setUltimo] = useState<ModoAuth>('login')
  if (modo && modo !== ultimo) setUltimo(modo)
  const mostrado = modo ?? ultimo

  return (
    <Dialog id="modalAuth" data-testid="auth-dialogo" open={modo !== null} onClose={onCerrar} fullWidth maxWidth="xs" aria-labelledby="tituloAuth">
      {mostrado === 'login' ? (
        <FormLogin onCerrar={onCerrar} onCambiarModo={onCambiarModo} onLoginCorrecto={onLoginCorrecto} />
      ) : (
        <FormRegistro onCerrar={onCerrar} onCambiarModo={onCambiarModo} />
      )}
    </Dialog>
  )
}

function FormLogin({ onCerrar, onCambiarModo, onLoginCorrecto }: Omit<Props, 'modo'>) {
  const { t } = useI18n()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      onLoginCorrecto(await login({ usuario, password }))
    } catch (err) {
      setError(err instanceof ErrorApi ? 'login.errorCredenciales' : 'error.servidor')
      setEnviando(false)
    }
  }

  return (
    <Box component="form" id="form-login" onSubmit={enviar}>
      <DialogTitle id="tituloAuth">{t('login.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            id="usuario"
            slotProps={{ htmlInput: { 'data-testid': 'auth-usuario' } }}
            label={t('login.usuario')}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            autoFocus
            autoComplete="username"
          />
          <TextField
            id="password"
            slotProps={{ htmlInput: { 'data-testid': 'auth-password' } }}
            type="password"
            label={t('login.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && (
            <Alert id="mensaje-error" data-testid="auth-error" severity="error">
              {t(error)}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button id="btnCancelar" data-testid="auth-cancelar" onClick={onCerrar}>
          {t('comun.cancelar')}
        </Button>
        <Button
          id="btnLogin"
          data-testid="auth-enviar"
          type="submit"
          variant="contained"
          loading={enviando}
          loadingPosition="start"
          startIcon={<LoginIcon />}
        >
          {t('login.entrar')}
        </Button>
      </DialogActions>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ pb: 2 }}>
        {t('login.noTienesCuenta')}{' '}
        <Link component="button" type="button" variant="body2" id="btnIrRegistro" data-testid="auth-cambiar" onClick={() => onCambiarModo('registro')}>
          {t('login.registrate')}
        </Link>
      </Typography>
    </Box>
  )
}

function FormRegistro({ onCerrar, onCambiarModo }: Pick<Props, 'onCerrar' | 'onCambiarModo'>) {
  const { t } = useI18n()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [noCoinciden, setNoCoinciden] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== password2) {
      setNoCoinciden(true) // no se envia nada
      return
    }
    setEnviando(true)
    try {
      await registrar({ usuario, password })
      onCambiarModo('login') // cuenta creada: ahora a iniciar sesion
    } catch (err) {
      setError(err instanceof ErrorApi ? 'login.errorRegistro' : 'error.servidor')
      setEnviando(false)
    }
  }

  return (
    <Box component="form" id="form-registro" onSubmit={enviar}>
      <DialogTitle id="tituloAuth">{t('login.registroTitle')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            id="usuario"
            slotProps={{ htmlInput: { 'data-testid': 'auth-usuario' } }}
            label={t('login.usuario')}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            autoFocus
            autoComplete="username"
          />
          <TextField
            id="password"
            slotProps={{ htmlInput: { 'data-testid': 'auth-password' } }}
            type="password"
            label={t('login.password')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setNoCoinciden(false)
            }}
            required
            autoComplete="new-password"
          />
          <TextField
            id="password2"
            slotProps={{
              htmlInput: { 'data-testid': 'auth-password2' },
              formHelperText: { 'data-testid': 'auth-error' } as object, // MUI no tipa data-* en este slot
            }}
            type="password"
            label={t('login.password2')}
            value={password2}
            onChange={(e) => {
              setPassword2(e.target.value)
              setNoCoinciden(false)
            }}
            required
            autoComplete="new-password"
            error={noCoinciden}
            helperText={noCoinciden ? t('login.passwordsNoCoinciden') : undefined}
          />
          {error && (
            <Alert id="mensaje-error" data-testid="auth-error" severity="error">
              {t(error)}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button id="btnCancelar" data-testid="auth-cancelar" onClick={onCerrar}>
          {t('comun.cancelar')}
        </Button>
        <Button
          id="btnRegistro"
          data-testid="auth-enviar"
          type="submit"
          variant="contained"
          loading={enviando}
          loadingPosition="start"
          startIcon={<PersonAddIcon />}
        >
          {t('login.crearCuenta')}
        </Button>
      </DialogActions>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ pb: 2 }}>
        {t('login.yaTienesCuenta')}{' '}
        <Link component="button" type="button" variant="body2" id="btnIrLogin" data-testid="auth-cambiar" onClick={() => onCambiarModo('login')}>
          {t('login.iniciaSesion')}
        </Link>
      </Typography>
    </Box>
  )
}
