import { Card, CardContent, Typography } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { CHART_INFO_COLOR } from '../../constants'
import type { ByWarehouseEntry } from '../../api/types'

interface Props {
  data: ByWarehouseEntry[]
}

export function WarehouseChart({ data }: Props) {
  const labels = data.map((d) => d.warehouse)
  const counts = data.map((d) => d.count)

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Orders by Warehouse
        </Typography>
        <BarChart
          xAxis={[{ data: labels, scaleType: 'band', tickLabelStyle: { fontSize: 10 } }]}
          series={[{ data: counts, color: CHART_INFO_COLOR }]}
          height={240}
          margin={{ bottom: 40 }}
        />
      </CardContent>
    </Card>
  )
}