import { Card, CardContent, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import { REVENUE_K_DIVISOR, CHART_PRIMARY_COLOR, CHART_SECONDARY_COLOR } from '../../constants'
import type { ByMonthEntry } from '../../api/types'

interface Props {
  data: ByMonthEntry[]
}

export function MonthlyTrendChart({ data }: Props) {
  const labels = data.map((d) => d.month)
  const counts = data.map((d) => d.order_count)
  const revenues = data.map((d) => Math.round(d.revenue / REVENUE_K_DIVISOR))

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Monthly Order Volume &amp; Revenue ($K)
        </Typography>
        <LineChart
          xAxis={[{ data: labels, scaleType: 'point', tickLabelStyle: { fontSize: 10 } }]}
          series={[
            { data: counts, label: 'Orders', color: CHART_PRIMARY_COLOR },
            { data: revenues, label: 'Revenue ($K)', color: CHART_SECONDARY_COLOR },
          ]}
          height={280}
          margin={{ left: 50, right: 20, bottom: 40 }}
        />
      </CardContent>
    </Card>
  )
}