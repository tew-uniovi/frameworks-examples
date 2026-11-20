import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import type { Embalse } from '../api/tipos'
import { useI18n } from '../context/i18n'

// En pantallas muy estrechas se oculta la columna Id para que quepan las acciones
const ocultoEnMovil = { display: { xs: 'none', sm: 'table-cell' } }

interface Props {
  visibles: Embalse[]
  cargando: boolean
  ultimaActualizacion: Date | null
  filtro: string
  onFiltrar: (texto: string) => void
  pagina: number
  ultimaPagina: number
  onIrAPagina: (delta: number) => void
  onEditar: (embalse: Embalse) => void
  onEliminar: (embalse: Embalse) => void
}

export function ListadoView({
  visibles,
  cargando,
  ultimaActualizacion,
  filtro,
  onFiltrar,
  pagina,
  ultimaPagina,
  onIrAPagina,
  onEditar,
  onEliminar,
}: Props) {
  const { t, formatoNumero, formatoFecha } = useI18n()

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('listado.actualizado')}{' '}
        <span id="fechaActualizado">{ultimaActualizacion && formatoFecha(ultimaActualizacion)}</span>
      </Typography>

      <TextField
        id="filtro-nombre"
        fullWidth
        size="small"
        placeholder={t('listado.filtroPlaceholder')}
        value={filtro}
        onChange={(e) => onFiltrar(e.target.value)}
        sx={{ mb: 2, bgcolor: 'background.paper' }}
        slotProps={{
          htmlInput: { 'aria-label': t('listado.filtroPlaceholder') },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <TableContainer component={Paper} variant="outlined">
        {cargando && <LinearProgress />}
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={ocultoEnMovil}>{t('tabla.id')}</TableCell>
              <TableCell>{t('tabla.nombre')}</TableCell>
              <TableCell>{t('tabla.capacidad')}</TableCell>
              <TableCell>{t('tabla.nivel')}</TableCell>
              <TableCell>{t('tabla.acciones')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody id="tabla-embalses">
            {visibles.map((e) => (
              <TableRow key={e.id} hover>
                <TableCell sx={ocultoEnMovil}>{e.id}</TableCell>
                <TableCell>{e.nombre}</TableCell>
                <TableCell>{formatoNumero(e.capacidadHm3)}</TableCell>
                <TableCell>{formatoNumero(e.nivelActualHm3)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={t('tabla.editar')}>
                    <IconButton size="small" aria-label={t('tabla.editar')} onClick={() => onEditar(e)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('tabla.eliminar')}>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={t('tabla.eliminar')}
                      onClick={() => onEliminar(e)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack id="paginador" direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
        <Button variant="outlined" size="small" disabled={pagina === 0} onClick={() => onIrAPagina(-1)}>
          {t('listado.anterior')}
        </Button>
        <Typography variant="body2">
          {t('listado.pagina')} {pagina + 1} {t('listado.de')} {ultimaPagina + 1}
        </Typography>
        <Button variant="outlined" size="small" disabled={pagina >= ultimaPagina} onClick={() => onIrAPagina(1)}>
          {t('listado.siguiente')}
        </Button>
      </Stack>
    </Box>
  )
}
