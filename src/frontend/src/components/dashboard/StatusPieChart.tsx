import { Card, CardContent, Typography } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import { STATUS_CHART_COLORS } from '../../constants'
import type { OrderStats } from '../../api/types'

interface Props {
  byStatus: OrderStats['by_status']
}

export function StatusPieChart({ byStatus }: Props) {
  const data = Object.entries(byStatus).map(([status, { count }], i) => ({
    id: i,
    value: count,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    color: STATUS_CHART_COLORS[status] ?? '#9e9e9e',
  }))

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Orders by Status
        </Typography>
        <PieChart
          series={[{ data, innerRadius: 40, paddingAngle: 2, cornerRadius: 3 }]}
          height={300}
        />
      </CardContent>
    </Card>
  )
}