import { Card, CardContent, Typography, Grid, Box } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import type { SupplierPerformance as Perf } from '../../api/types'

interface Props {
  perf: Perf
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h6" fontWeight={600}>{value}</Typography>
      </CardContent>
    </Card>
  )
}

export function SupplierPerformance({ perf }: Props) {
  const months = perf.monthly_trend.map((m) => m.month)
  const counts = perf.monthly_trend.map((m) => m.order_count)

  return (
    <Box mb={3}>
      <Typography variant="h6" fontWeight={600} mb={1.5}>Performance Metrics</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard label="Avg Delivery Days" value={perf.avg_delivery_days.toFixed(1)} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard label="Rejection Rate" value={`${(perf.rejection_rate * 100).toFixed(1)}%`} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard label="Avg Order Value" value={`$${perf.avg_order_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard label="Price Consistency" value={`${(perf.price_consistency * 100).toFixed(1)}%`} />
        </Grid>
      </Grid>

      {months.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Monthly Order Trend</Typography>
            <LineChart
              xAxis={[{ data: months, scaleType: 'point', tickLabelStyle: { fontSize: 10 } }]}
              series={[{ data: counts, label: 'Orders', color: '#1976d2' }]}
              height={220}
              margin={{ left: 50, right: 20, bottom: 40 }}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
