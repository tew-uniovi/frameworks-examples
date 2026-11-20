import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;

// Un proyecto por cliente. Cambian la URL y el atributo que usa getByTestId():
// Angular y React lo exponen en data-testid; Flutter, en el identificador de
// semantica (Semantics(identifier)), que se publica como flt-semantics-identifier.
const clientes = [
  { name: 'angular', url: process.env.ANGULAR_URL ?? 'http://localhost:8081/aquaapp/', testIdAttribute: 'data-testid', lento: false },
  { name: 'react', url: process.env.REACT_URL ?? 'http://localhost:8082/aquaapp/', testIdAttribute: 'data-testid', lento: false },
  { name: 'flutter', url: process.env.FLUTTER_URL ?? 'http://localhost:8083/aquaapp/', testIdAttribute: 'flt-semantics-identifier', lento: true },
];

export default defineConfig({
  testDir: './tests',
  // El backend es compartido y guarda los datos en memoria: nada en paralelo.
  workers: 1,
  fullyParallel: false,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: CI
    ? [['list'], ['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    locale: 'es-ES',
    viewport: { width: 1280, height: 800 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: clientes.map(({ name, url, testIdAttribute, lento }) => ({
    name,
    use: {
      ...devices['Desktop Chrome'],
      // Chrome del sistema en local; el chromium de Playwright en CI.
      ...(CI ? {} : { channel: 'chrome' }),
      locale: 'es-ES',
      viewport: { width: 1280, height: 800 },
      baseURL: url,
      testIdAttribute,
      actionTimeout: lento ? 30_000 : 15_000,
      navigationTimeout: 30_000,
    },
    expect: { timeout: lento ? 20_000 : 10_000 },
  })),
});
