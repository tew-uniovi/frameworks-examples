import { createTheme } from '@mui/material/styles'

// Paleta derivada del azul oscuro del logo de aquaapp (#093074). Con `cssVariables` y
// `colorSchemeSelector: 'media'` el tema sigue la preferencia clara/oscura del sistema.
export const tema = createTheme({
  cssVariables: { colorSchemeSelector: 'media' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#093074' },
        secondary: { main: '#1976d2' },
        background: { default: '#f5f7fb' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#8fb2ff' },
        secondary: { main: '#90caf9' },
      },
    },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
  shape: { borderRadius: 8 },
})
