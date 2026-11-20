import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import StorageIcon from '@mui/icons-material/Storage'
import type { Embalse } from '../api/tipos'
import { useI18n } from '../context/i18n'
import { nivelMedio } from '../utils/listado'

/** Panel lateral (aside): nº de embalses y nivel medio, sobre TODOS los embalses. */
export function PanelIndicadores({ embalses }: { embalses: Embalse[] }) {
  const { t, formatoNumero } = useI18n()
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <StorageIcon color="primary" />
          <Typography>
            {embalses.length} {t('panel.embalses')}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ShowChartIcon color="primary" />
          <Typography>
            {t('panel.nivelMedio')}: {formatoNumero(nivelMedio(embalses))} hm³
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  )
}
