import { describe, expect, it } from 'vitest'
import { crearJwt } from '../test/jwt'
import { decodificarPayload, tokenCaducado, usuarioDeToken } from './jwt'

describe('jwt', () => {
  it('lee el usuario del claim sub (incluidos caracteres no ASCII)', () => {
    expect(usuarioDeToken(crearJwt({ sub: 'ana' }))).toBe('ana')
    expect(usuarioDeToken(crearJwt({ sub: 'Ñandú' }))).toBe('Ñandú')
  })

  it('devuelve null con tokens ausentes o mal formados', () => {
    expect(usuarioDeToken(null)).toBeNull()
    expect(decodificarPayload('no-es-un-jwt')).toBeNull()
    expect(decodificarPayload('a.%%%.c')).toBeNull()
  })

  it('detecta la caducidad por el claim exp', () => {
    const ahora = 1_000_000_000_000
    expect(tokenCaducado(crearJwt({ exp: ahora / 1000 + 60 }), ahora)).toBe(false)
    expect(tokenCaducado(crearJwt({ exp: ahora / 1000 - 1 }), ahora)).toBe(true)
  })

  it('sin token o sin exp se trata como caducado', () => {
    expect(tokenCaducado(null)).toBe(true)
    expect(tokenCaducado(crearJwt({ sub: 'ana' }))).toBe(true)
  })
})
