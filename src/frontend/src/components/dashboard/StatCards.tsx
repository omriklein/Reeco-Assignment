import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { MILLION, THOUSAND } from '../../constants'
import type { OrderStats } from '../../api/types'
import type { PaletteColor } from '@mui/material'

type PaletteKey = 'primary' | 'secondary' | 'info'

function StatCard({
  title,
  value,
  icon,
  paletteKey,
}: {
  title: string
  value: string
  icon: React.ReactNode
  paletteKey: PaletteKey
}) {
  const theme = useTheme()
  const color = (theme.palette[paletteKey] as PaletteColor).main

  return (
    <Card sx={{ overflow: 'hidden', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', bgcolor: color }} />
      <CardContent sx={{ pt: 2.5, pb: '20px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'text.secondary',
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 500,
                fontSize: '1.8rem',
                color: 'text.primary',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color, 0.1),
              color: color,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const fmt = (n: number) =>
  n >= MILLION
    ? `$${(n / MILLION).toFixed(1)}M`
    : n >= THOUSAND
    ? `$${(n / THOUSAND).toFixed(0)}K`
    : `$${n?.toFixed(2) || 0}`

interface Props {
  stats: OrderStats
}

export function StatCards({ stats }: Props) {
  const avg_order_revenue = stats.total_orders > 0 ? stats.total_revenue / stats.total_orders : 0
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Total Orders" value={stats.total_orders.toLocaleString()} icon={<ShoppingCartIcon />} paletteKey="primary" />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Total Revenue" value={fmt(stats.total_revenue)} icon={<AttachMoneyIcon />} paletteKey="secondary" />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Avg Order Value" value={fmt(avg_order_revenue)} icon={<TrendingUpIcon />} paletteKey="info" />
      </Grid>
    </Grid>
  )
}
