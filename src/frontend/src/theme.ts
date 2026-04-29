import { createTheme } from '@mui/material'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565c0' },
    background: { default: '#f5f7fa' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: { defaultProps: { elevation: 1 } },
    MuiButton: { defaultProps: { disableElevation: true } },
  },
})