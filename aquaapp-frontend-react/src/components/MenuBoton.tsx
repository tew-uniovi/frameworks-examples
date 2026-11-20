import { useState, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface Props {
  /** id del boton que abre el menu (estable: lo usan las pruebas) */
  id: string
  icono: ReactNode
  /** Texto del boton; en pantallas muy estrechas se oculta y queda solo el icono. */
  etiqueta: ReactNode
  ariaLabel: string
  alinearDerecha?: boolean
  /** MenuItem(s) del desplegable. Al pulsar cualquiera, el menu se cierra. */
  children: ReactNode
}

/** Boton + Menu de MUI (el equivalente de un dropdown de navbar). */
export function MenuBoton({ id, icono, etiqueta, ariaLabel, alinearDerecha = false, children }: Props) {
  const [ancla, setAncla] = useState<HTMLElement | null>(null)
  const abierto = ancla !== null

  return (
    <>
      <Button
        id={id}
        color="inherit"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={abierto ? `${id}-menu` : undefined}
        onClick={(e) => setAncla(e.currentTarget)}
        startIcon={icono}
        endIcon={<ExpandMoreIcon />}
        sx={{ textTransform: 'none', '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } } }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          {etiqueta}
        </Box>
      </Button>
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
