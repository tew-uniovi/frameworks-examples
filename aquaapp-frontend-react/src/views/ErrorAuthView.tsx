import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LoginIcon from '@mui/icons-material/Login'
import { useI18n } from '../context/i18n'

/** 401 inesperado (o token caducado): la sesion se ha limpiado y se ofrece volver al login. */
export function ErrorAuthView({ onIrAlLogin }: { onIrAlLogin: () => void }) {
  const { t } = useI18n()
  return (
    <Card variant="outlined" sx={{ maxWidth: 420, mx: 'auto', mt: 5 }}>
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" component="h3" gutterBottom>
          {t('login.sesionNoValidaTitle')}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t('login.sesionNoValida')}
        </Typography>
        <Button id="btnIrAlLogin" variant="contained" fullWidth startIcon={<LoginIcon />} onClick={onIrAlLogin}>
          {t('login.irAlLogin')}
        </Button>
      </CardContent>
    </Card>
  )
}
