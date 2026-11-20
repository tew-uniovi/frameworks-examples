import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderConI18n } from '../test/render'
import { FormularioView } from './FormularioView'

describe('FormularioView', () => {
  it('no guarda si el nivel supera la capacidad y muestra el error', async () => {
    const onGuardar = vi.fn().mockResolvedValue(undefined)
    renderConI18n(<FormularioView onGuardar={onGuardar} />)
    const usuario = userEvent.setup()
    await usuario.type(document.getElementById('nombre')!, 'Embalse X')
    await usuario.type(document.getElementById('capacidadHm3')!, '10')
    await usuario.type(document.getElementById('nivelActualHm3')!, '12')
    await usuario.click(document.getElementById('btnGuardar')!)
    expect(await screen.findByText('form.nivelSuperaCapacidad')).toBeInTheDocument()
    expect(onGuardar).not.toHaveBeenCalled()
  })

  it('en el alta envia un embalse con id null', async () => {
    const onGuardar = vi.fn().mockResolvedValue(undefined)
    renderConI18n(<FormularioView onGuardar={onGuardar} />)
    const usuario = userEvent.setup()
    await usuario.type(document.getElementById('nombre')!, 'Embalse X')
    await usuario.type(document.getElementById('capacidadHm3')!, '10.5')
    await usuario.type(document.getElementById('nivelActualHm3')!, '4')
    await usuario.click(document.getElementById('btnGuardar')!)
    await waitFor(() =>
      expect(onGuardar).toHaveBeenCalledWith({ id: null, nombre: 'Embalse X', capacidadHm3: 10.5, nivelActualHm3: 4 }),
    )
  })

  it('en la edicion precarga los datos y conserva el id', async () => {
    const onGuardar = vi.fn().mockResolvedValue(undefined)
    renderConI18n(
      <FormularioView embalse={{ id: 3, nombre: 'Tanes', capacidadHm3: 33.3, nivelActualHm3: 21.7 }} onGuardar={onGuardar} />,
    )
    expect(document.getElementById('nombre')).toHaveValue('Tanes')
    await userEvent.setup().click(document.getElementById('btnGuardar')!)
    await waitFor(() => expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ id: 3, nombre: 'Tanes' })))
  })
})
