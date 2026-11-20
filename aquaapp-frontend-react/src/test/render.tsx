import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { I18nContext, type ValorI18n } from '../context/i18n'

/** i18n de prueba: devuelve la propia clave como texto. */
const i18nDePrueba: ValorI18n = {
  idioma: 'es',
  setIdioma: () => {},
  t: (clave) => clave,
  formatoNumero: (n) => String(n),
  formatoFecha: (f) => f.toISOString(),
}

export function renderConI18n(ui: ReactElement) {
  return render(<I18nContext value={i18nDePrueba}>{ui}</I18nContext>)
}
