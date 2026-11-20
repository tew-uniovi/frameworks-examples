import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
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
  const { t } = useI18n()
  // Durante la animacion de cierre `modo` ya es null: se recuerda el ultimo para no vaciar el contenido
  const [ultimo, setUltimo] = useState<ModoAuth>('login')
  if (modo && modo !== ultimo) setUltimo(modo)
  const mostrado = modo ?? ultimo

  return (
    <Dialog
      id="modalAuth"
      open={modo !== null}
      onClose={onCerrar}
      fullWidth
      maxWidth="xs"
      aria-labelledby="tituloAuth"
    >
      <DialogTitle id="tituloAuth" sx={{ pr: 6 }}>
        {t(mostrado === 'login' ? 'login.title' : 'login.registroTitle')}
        <IconButton
          aria-label="Cerrar"
          onClick={onCerrar}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {mostrado === 'login' ? (
          <FormLogin onCambiarModo={onCambiarModo} onLoginCorrecto={onLoginCorrecto} />
        ) : (
          <FormRegistro onCambiarModo={onCambiarModo} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function FormLogin({ onCambiarModo, onLoginCorrecto }: Pick<Props, 'onCambiarModo' | 'onLoginCorrecto'>) {
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
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField
          id="usuario"
          label={t('login.usuario')}
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          autoFocus
          autoComplete="username"
        />
        <TextField
          id="password"
          type="password"
          label={t('login.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && (
          <Alert id="mensaje-error" severity="error">
            {t(error)}
          </Alert>
        )}
        <Button
          id="btnLogin"
          type="submit"
          variant="contained"
          loading={enviando}
          loadingPosition="start"
          startIcon={<LoginIcon />}
        >
          {t('login.entrar')}
        </Button>
        <Typography variant="body2" color="text.secondary" align="center">
          {t('login.noTienesCuenta')}{' '}
          <Link component="button" type="button" id="btnIrRegistro" onClick={() => onCambiarModo('registro')}>
            {t('login.registrate')}
          </Link>
        </Typography>
      </Stack>
    </Box>
  )
}

function FormRegistro({ onCambiarModo }: Pick<Props, 'onCambiarModo'>) {
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
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField
          id="usuario"
          label={t('login.usuario')}
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          autoFocus
          autoComplete="username"
        />
        <TextField
          id="password"
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
          <Alert id="mensaje-error" severity="error">
            {t(error)}
          </Alert>
        )}
        <Button
          id="btnRegistro"
          type="submit"
          variant="contained"
          loading={enviando}
          loadingPosition="start"
          startIcon={<PersonAddIcon />}
        >
          {t('login.crearCuenta')}
        </Button>
        <Typography variant="body2" color="text.secondary" align="center">
          {t('login.yaTienesCuenta')}{' '}
          <Link component="button" type="button" id="btnIrLogin" onClick={() => onCambiarModo('login')}>
            {t('login.iniciaSesion')}
          </Link>
        </Typography>
      </Stack>
    </Box>
  )
}
