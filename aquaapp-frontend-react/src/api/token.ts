// Almacenamiento del JWT en sessionStorage (clave "jwt", como el cliente original).
const CLAVE = 'jwt'

export const getToken = (): string | null => sessionStorage.getItem(CLAVE)
export const setToken = (token: string): void => sessionStorage.setItem(CLAVE, token)
export const clearToken = (): void => sessionStorage.removeItem(CLAVE)
