import { createTheme } from '@mui/material'

const FOREST_DARK = '#0f2418'
const FOREST_MID = '#1b4332'
const FOREST_LIGHT = '#2d6a4f'
const AMBER = '#d97706'
const AMBER_LIGHT = '#fbbf24'
const PARCHMENT = '#f5f3ef'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: FOREST_MID,
      dark: FOREST_DARK,
      light: FOREST_LIGHT,
      contrastText: '#ffffff',
    },
    secondary: {
      main: AMBER,
      dark: '#b45309',
      light: AMBER_LIGHT,
      contrastText: '#ffffff',
    },
    background: {
      default: PARCHMENT,
      paper: '#ffffff',
    },
    success: { main: '#15803d', light: '#d1fae5', dark: '#065f46' },
    warning: { main: AMBER, light: '#fef3c7', dark: '#92400e' },
    error: { main: '#dc2626', light: '#fee2e2', dark: '#991b1b' },
    info: { main: '#0369a1', light: '#e0f2fe', dark: '#01579b' },
    text: { primary: '#1c1917', secondary: '#78716c' },
    divider: 'rgba(15,36,24,0.08)',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h5: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h6: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
    subtitle1: { fontWeight: 600, letterSpacing: '0.01em' },
    overline: { letterSpacing: '0.12em', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid rgba(15,36,24,0.07)`,
          boxShadow: '0 1px 3px rgba(15,36,24,0.06), 0 4px 16px rgba(15,36,24,0.04)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { fontWeight: 600, letterSpacing: '0.02em', textTransform: 'none' },
        containedPrimary: {
          backgroundColor: FOREST_MID,
          '&:hover': { backgroundColor: FOREST_DARK },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.03em' },
        sizeSmall: { height: 22 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: FOREST_DARK,
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: FOREST_DARK, borderRight: 'none' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: '#a7c5b1',
          borderRadius: 8,
          '& .MuiListItemIcon-root': { color: '#6b9e80' },
          '&.Mui-selected': {
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: AMBER_LIGHT,
            '& .MuiListItemIcon-root': { color: AMBER_LIGHT },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.09)' },
          },
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.04)',
            color: '#d1fae5',
          },
        },
      },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: { root: { backgroundColor: '#ffffff' } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
})
