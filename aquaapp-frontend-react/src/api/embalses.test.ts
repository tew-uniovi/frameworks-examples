import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { crearJwt } from '../test/jwt'
import { actualizarEmbalse, crearEmbalse, eliminarEmbalse, listarEmbalses } from './embalses'
import { ErrorApi } from './http'
import { getToken, setToken } from './token'

const fetchMock = vi.fn()

function respuesta(status: number, cuerpo?: unknown): Response {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), { status })
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  sessionStorage.clear()
  setToken(crearJwt({ sub: 'admin', exp: Date.now() / 1000 + 3600 }))
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe('api de embalses', () => {
  it('lista con la cabecera Authorization: Bearer', async () => {
    fetchMock.mockResolvedValue(respuesta(200, [{ id: 1, nombre: 'Tanes', capacidadHm3: 33, nivelActualHm3: 21 }]))
    const lista = await listarEmbalses()
    expect(lista).toHaveLength(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/embalses')
    expect(new Headers(init.headers).get('Authorization')).toBe(`Bearer ${getToken()}`)
  })

  it('crea con POST, actualiza con PUT /{id} y elimina con DELETE /{id}', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(respuesta(200, {})))
    const e = { id: null, nombre: 'Nuevo', capacidadHm3: 10, nivelActualHm3: 5 }
    await crearEmbalse(e)
    await actualizarEmbalse({ ...e, id: 7 })
    await eliminarEmbalse(7)
    const llamadas = fetchMock.mock.calls as [string, RequestInit][]
    expect(llamadas.map(([url, init]) => `${init.method} ${url}`)).toEqual([
      'POST /api/embalses',
      'PUT /api/embalses/7',
      'DELETE /api/embalses/7',
    ])
    expect(JSON.parse(llamadas[0][1].body as string)).toEqual(e)
  })

  it('propaga el codigo HTTP como ErrorApi (403 sin permiso)', async () => {
    fetchMock.mockResolvedValue(respuesta(403))
    await expect(eliminarEmbalse(1)).rejects.toMatchObject({ name: 'ErrorApi', status: 403 })
  })

  it('un token caducado se trata como 401 sin llamar al servidor y limpia la sesion', async () => {
    setToken(crearJwt({ sub: 'ana', exp: Date.now() / 1000 - 10 }))
    const error = await listarEmbalses().catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ErrorApi)
    expect((error as ErrorApi).status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(getToken()).toBeNull()
  })
})
