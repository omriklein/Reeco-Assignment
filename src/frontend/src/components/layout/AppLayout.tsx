import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, AppBar, Divider } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ListAltIcon from '@mui/icons-material/ListAlt'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Outlet, NavLink, useLocation } from 'react-router-dom'

const DRAWER_WIDTH = 220

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Orders', path: '/orders', icon: <ListAltIcon /> },
  { label: 'Anomalies', path: '/anomalies', icon: <WarningAmberIcon /> },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" fontWeight={700} noWrap>
            Reeco — Order Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Divider />
        <List dense>
          {NAV_ITEMS.map((item) => {
            const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
            return (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                selected={active}
                sx={{ borderRadius: 1, mx: 1, my: 0.25 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            )
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
