import { createTheme } from '@mui/material/styles'

// Azul oscuro del logo de aquaapp (#093074) como color primario.
export const tema = createTheme({
  palette: {
    primary: { main: '#093074' },
    secondary: { main: '#1976d2' },
    background: { default: '#f5f7fb' },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
  shape: { borderRadius: 8 },
})
