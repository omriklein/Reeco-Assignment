import { Card, CardContent, Typography } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import type { OrderStats } from '../../api/types'

const STATUS_PALETTE: Record<string, string> = {
  pending: '#ed6c02',
  approved: '#1976d2',
  rejected: '#d32f2f',
  shipped: '#0288d1',
  delivered: '#2e7d32',
  cancelled: '#757575',
}

interface Props {
  byStatus: OrderStats['by_status']
}

export function StatusPieChart({ byStatus }: Props) {
  const data = Object.entries(byStatus).map(([status, { count }], i) => ({
    id: i,
    value: count,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    color: STATUS_PALETTE[status] ?? '#9e9e9e',
  }))

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Orders by Status
        </Typography>
        <PieChart
          series={[{ data, innerRadius: 40, paddingAngle: 2, cornerRadius: 3 }]}
          height={260}
          slotProps={{ legend: { direction: 'column', position: { vertical: 'middle', horizontal: 'right' } } }}
        />
      </CardContent>
    </Card>
  )
}
