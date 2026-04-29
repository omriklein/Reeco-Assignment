import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { MILLION, THOUSAND } from '../../constants'
import type { OrderStats } from '../../api/types'

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: 'primary.main', opacity: 0.7 }}>{icon}</Box>
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
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Total Orders" value={stats.total_orders.toLocaleString()} icon={<ShoppingCartIcon fontSize="large" />} />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Total Revenue" value={fmt(stats.total_revenue)} icon={<AttachMoneyIcon fontSize="large" />} />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Avg Order Value" value={fmt(stats.avg_order_value)} icon={<TrendingUpIcon fontSize="large" />} />
      </Grid>
    </Grid>
  )
}