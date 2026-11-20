import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import LoginIcon from '@mui/icons-material/Login'
import { useI18n } from '../context/i18n'

/** 401 inesperado (o token caducado): la sesion se ha limpiado y se ofrece volver al login. */
export function ErrorAuthView({ onIrAlLogin }: { onIrAlLogin: () => void }) {
  const { t } = useI18n()
  return (
    <Container maxWidth="xs" disableGutters sx={{ mt: 5 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" component="h3" gutterBottom>
            {t('login.sesionNoValidaTitle')}
          </Typography>
          <Typography color="text.secondary">{t('login.sesionNoValida')}</Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Button id="btnIrAlLogin" variant="contained" startIcon={<LoginIcon />} onClick={onIrAlLogin}>
            {t('login.irAlLogin')}
          </Button>
        </CardActions>
      </Card>
    </Container>
  )
}
