import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ListAltIcon from '@mui/icons-material/ListAlt'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { DRAWER_WIDTH } from '../../constants'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Orders', path: '/orders', icon: <ListAltIcon fontSize="small" /> },
  { label: 'Anomalies', path: '/anomalies', icon: <WarningAmberIcon fontSize="small" /> },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {/* Brand */}
        <Box sx={{ px: 2.5, pt: 3, pb: 2.5 }}>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              mb: 0.75,
              display: 'block',
            }}
          >
            Procurement
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              fontSize: '1.4rem',
              color: 'secondary.light',
              lineHeight: 1,
              letterSpacing: '-0.01em',
            }}
          >
            Reeco
          </Typography>
        </Box>

        <Box sx={{ mx: 2, height: '1px', bgcolor: 'rgba(255,255,255,0.07)', mb: 1.5 }} />

        <List dense sx={{ px: 1, '& .MuiListItemButton-root': { mb: 0.25 } }}>
          {NAV_ITEMS.map((item) => {
            const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
            return (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                selected={active}
                sx={{
                  borderLeft: (t) => active ? `3px solid ${t.palette.secondary.light}` : '3px solid transparent',
                  pl: active ? 1.25 : 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: { sx: { fontSize: '0.875rem', fontWeight: active ? 600 : 400 } },
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>

        <Box sx={{ mt: 'auto', px: 2.5, pb: 2.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.63rem', letterSpacing: '0.06em' }}>
            Order Management v1
          </Typography>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3.5, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  )
}
