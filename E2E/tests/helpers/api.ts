// Cliente mínimo del backend para preparar y limpiar datos desde las pruebas.
// Habla con el MISMO origen que el cliente bajo prueba (nginx hace de proxy de
// /auth/* y /api/*), de modo que también ejercita el proxy.

export interface Embalse {
  id: number;
  nombre: string;
  capacidadHm3: number;
  nivelActualHm3: number;
}

export type NuevoEmbalse = Omit<Embalse, 'id'>;

export class ApiClient {
  private readonly origin: string;
  private token?: string;

  /** @param baseURL URL del cliente (p. ej. http://localhost:8081/aquaapp/); solo se usa su origen. */
  constructor(baseURL: string) {
    this.origin = new URL(baseURL).origin;
  }

  /** Intenta iniciar sesión y devuelve el código HTTP y, si va bien, el token. */
  async intentarLogin(usuario: string, password: string): Promise<{ status: number; token?: string }> {
    const res = await fetch(`${this.origin}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password }),
    });
    if (!res.ok) return { status: res.status };
    const { token } = (await res.json()) as { token: string };
    return { status: res.status, token };
  }

  /** Inicia sesión como admin (una sola vez) y guarda el JWT. */
  private async autenticar(): Promise<string> {
    if (!this.token) {
      const { token, status } = await this.intentarLogin('admin', 'admin');
      if (!token) throw new Error(`No se pudo iniciar sesión como admin en ${this.origin} (HTTP ${status})`);
      this.token = token;
    }
    return this.token;
  }

  private async peticion(metodo: string, ruta: string, cuerpo?: unknown): Promise<Response> {
    const token = await this.autenticar();
    return fetch(`${this.origin}${ruta}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(cuerpo === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  }

  async listarEmbalses(): Promise<Embalse[]> {
    const res = await this.peticion('GET', '/api/embalses');
    if (!res.ok) throw new Error(`GET /api/embalses -> HTTP ${res.status}`);
    return (await res.json()) as Embalse[];
  }

  async crearEmbalse(embalse: NuevoEmbalse): Promise<Embalse> {
    const res = await this.peticion('POST', '/api/embalses', embalse);
    if (!res.ok) throw new Error(`POST /api/embalses -> HTTP ${res.status}`);
    return (await res.json()) as Embalse;
  }

  /** Borra un embalse; ignora el 404 (la prueba pudo haberlo eliminado ya). */
  async borrarEmbalse(id: number): Promise<void> {
    const res = await this.peticion('DELETE', `/api/embalses/${id}`);
    if (!res.ok && res.status !== 404) throw new Error(`DELETE /api/embalses/${id} -> HTTP ${res.status}`);
  }

  async obtenerEmbalse(id: number): Promise<Embalse | undefined> {
    return (await this.listarEmbalses()).find((e) => e.id === id);
  }

  /** Borra todos los embalses cuyo nombre empieza por el prefijo (limpieza global). */
  async borrarEmbalsesConPrefijo(prefijo: string): Promise<number> {
    const residuales = (await this.listarEmbalses()).filter((e) => e.nombre.startsWith(prefijo));
    for (const e of residuales) await this.borrarEmbalse(e.id);
    return residuales.length;
  }
}
