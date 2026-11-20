import { test as base, expect } from '@playwright/test';
import { ApiClient, type Embalse } from './api';
import { Aquaapp } from './aquaapp';

/** Prefijo de todos los datos que crea la suite; la limpieza global borra lo que lo lleve. */
export const PREFIJO = 'E2E-';

interface Fixtures {
  app: Aquaapp;
  api: ApiClient;
  /** Embalse de prueba (capacidad 100, nivel 40) creado por API y borrado al terminar, falle o no la prueba. */
  embalse: Embalse;
}

export const test = base.extend<Fixtures>({
  app: async ({ page }, use) => {
    await use(new Aquaapp(page));
  },

  api: async ({ baseURL }, use) => {
    await use(new ApiClient(baseURL!));
  },

  embalse: async ({ api }, use, testInfo) => {
    const nombre = `${PREFIJO}${testInfo.project.name}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const creado = await api.crearEmbalse({ nombre, capacidadHm3: 100, nivelActualHm3: 40 });
    try {
      await use(creado);
    } finally {
      await api.borrarEmbalse(creado.id); // ignora el 404 si la prueba ya lo eliminó
    }
  },
});

// Limpieza global de la suite: por si algún embalse E2E-* hubiera quedado huérfano.
test.afterAll(async ({ baseURL }) => {
  await new ApiClient(baseURL!).borrarEmbalsesConPrefijo(PREFIJO);
});

export { expect };
