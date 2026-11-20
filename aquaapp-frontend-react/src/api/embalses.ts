import { apiFetch } from './http'
import type { Embalse } from './tipos'

const URL_EMBALSES = '/api/embalses'
const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function listarEmbalses(): Promise<Embalse[]> {
  const resp = await apiFetch(URL_EMBALSES)
  return (await resp.json()) as Embalse[]
}

export async function crearEmbalse(embalse: Embalse): Promise<void> {
  await apiFetch(URL_EMBALSES, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(embalse) })
}

export async function actualizarEmbalse(embalse: Embalse): Promise<void> {
  await apiFetch(`${URL_EMBALSES}/${embalse.id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(embalse),
  })
}

export async function eliminarEmbalse(id: number): Promise<void> {
  await apiFetch(`${URL_EMBALSES}/${id}`, { method: 'DELETE' })
}
