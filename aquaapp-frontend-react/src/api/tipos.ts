// Forma del JSON que devuelve /api/embalses y de las credenciales de login.
export interface Embalse {
  id: number | null
  nombre: string
  capacidadHm3: number
  nivelActualHm3: number
}

export interface Credenciales {
  usuario: string
  password: string
}
