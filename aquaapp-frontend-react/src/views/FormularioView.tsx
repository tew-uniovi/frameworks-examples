import { useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SaveIcon from '@mui/icons-material/Save'
import type { Embalse } from '../api/tipos'
import { useI18n } from '../context/i18n'

interface Props {
  /** Embalse a editar; undefined/null = alta. */
  embalse?: Embalse | null
  /** Guarda (POST o PUT segun tenga id). Si lanza, el formulario se queda abierto. */
  onGuardar: (embalse: Embalse) => Promise<void>
}

/** Formulario de alta/edicion, incrustado en <main> (no es un modal). */
export function FormularioView({ embalse, onGuardar }: Props) {
  const { t } = useI18n()
  const [nombre, setNombre] = useState(embalse?.nombre ?? '')
  const [capacidad, setCapacidad] = useState(embalse ? String(embalse.capacidadHm3) : '')
  const [nivel, setNivel] = useState(embalse ? String(embalse.nivelActualHm3) : '')
  const [nivelSupera, setNivelSupera] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const capacidadHm3 = Number.parseFloat(capacidad)
    const nivelActualHm3 = Number.parseFloat(nivel)
    if (nivelActualHm3 > capacidadHm3) {
      setNivelSupera(true) // el nivel no puede superar la capacidad
      return
    }
    setEnviando(true)
    try {
      await onGuardar({ id: embalse?.id ?? null, nombre, capacidadHm3, nivelActualHm3 })
    } catch {
      // el error (403, red...) ya lo muestra quien llama; el formulario sigue abierto
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Box component="form" id="form-embalse" onSubmit={enviar}>
      <Typography variant="h5" component="h3" sx={{ mt: 2, mb: 3 }}>
        {t('form.titulo')}
      </Typography>
      <input type="hidden" id="id" value={embalse?.id ?? ''} readOnly />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <TextField
          id="nombre"
          label={t('form.nombre')}
          placeholder={t('form.nombrePlaceholder')}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ gridColumn: { md: '1 / -1' } }}
        />
        <TextField
          id="capacidadHm3"
          type="number"
          label={t('form.capacidad')}
          placeholder={t('form.capacidadPlaceholder')}
          value={capacidad}
          onChange={(e) => {
            setCapacidad(e.target.value)
            setNivelSupera(false)
          }}
          required
          slotProps={{ htmlInput: { min: 0, step: 0.1 }, inputLabel: { shrink: true } }}
        />
        <TextField
          id="nivelActualHm3"
          type="number"
          label={t('form.nivel')}
          placeholder={t('form.nivelPlaceholder')}
          value={nivel}
          onChange={(e) => {
            setNivel(e.target.value)
            setNivelSupera(false)
          }}
          required
          error={nivelSupera}
          helperText={nivelSupera ? t('form.nivelSuperaCapacidad') : undefined}
          slotProps={{ htmlInput: { min: 0, step: 0.1 }, inputLabel: { shrink: true } }}
        />
      </Box>
      <Button
        id="btnGuardar"
        type="submit"
        variant="contained"
        loading={enviando}
        loadingPosition="start"
        startIcon={<SaveIcon />}
        sx={{ mt: 3 }}
      >
        {t('form.guardar')}
      </Button>
    </Box>
  )
}
