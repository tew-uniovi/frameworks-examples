import { useState, type ReactNode } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface Props {
  /** id del boton que abre el menu (estable: lo usan las pruebas) */
  id: string
  /** data-testid del boton (contrato de las pruebas de sistema E2E) */
  testId: string
  icono: ReactNode
  /** Texto del boton (solo se ve en pantallas anchas; en estrechas queda un IconButton con Tooltip). */
  etiqueta: ReactNode
  /** Nombre accesible del boton (y texto del Tooltip en pantallas estrechas). */
  ariaLabel: string
  alinearDerecha?: boolean
  /** MenuItem(s) del desplegable. Al pulsar cualquiera, el menu se cierra. */
  children: ReactNode
}

/** Boton + Menu de MUI (el desplegable de una AppBar). */
export function MenuBoton({ id, testId, icono, etiqueta, ariaLabel, alinearDerecha = false, children }: Props) {
  const ancho = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [ancla, setAncla] = useState<HTMLElement | null>(null)
  const abierto = ancla !== null

  const propsComunes = {
    id,
    'data-testid': testId,
    color: 'inherit' as const,
    'aria-label': ariaLabel,
    'aria-haspopup': 'menu' as const,
    'aria-expanded': abierto,
    'aria-controls': abierto ? `${id}-menu` : undefined,
    onClick: (e: React.MouseEvent<HTMLElement>) => setAncla(e.currentTarget),
  }

  return (
    <>
      {ancho ? (
        <Button {...propsComunes} startIcon={icono} endIcon={<ExpandMoreIcon />}>
          {etiqueta}
        </Button>
      ) : (
        <Tooltip title={ariaLabel}>
          <IconButton {...propsComunes}>{icono}</IconButton>
        </Tooltip>
      )}
      <Menu
        id={`${id}-menu`}
        anchorEl={ancla}
        open={abierto}
        onClose={() => setAncla(null)}
        onClick={() => setAncla(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: alinearDerecha ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: alinearDerecha ? 'right' : 'left' }}
        slotProps={{ list: { 'aria-labelledby': id } }}
      >
        {children}
      </Menu>
    </>
  )
}
