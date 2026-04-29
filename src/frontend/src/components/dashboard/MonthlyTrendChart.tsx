import { Card, CardContent, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import type { ByMonthEntry } from '../../api/types'

interface Props {
  data: ByMonthEntry[]
}

export function MonthlyTrendChart({ data }: Props) {
  const labels = data.map((d) => d.month)
  const counts = data.map((d) => d.order_count)
  const revenues = data.map((d) => Math.round(d.revenue / 1000))

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Monthly Order Volume &amp; Revenue (K)
        </Typography>
        <LineChart
          xAxis={[{ data: labels, scaleType: 'point', tickLabelStyle: { fontSize: 10 } }]}
          series={[
            { data: counts, label: 'Orders', yAxisId: 'orders', color: '#1976d2' },
            { data: revenues, label: 'Revenue ($K)', yAxisId: 'revenue', color: '#2e7d32' },
          ]}
          yAxis={[{ id: 'orders' }, { id: 'revenue' }]}
          rightAxis="revenue"
          height={280}
          margin={{ left: 50, right: 60, bottom: 40 }}
        />
      </CardContent>
    </Card>
  )
}
