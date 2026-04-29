import { Card, CardContent, Typography } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { useNavigate } from 'react-router-dom'
import type { TopSupplierEntry } from '../../api/types'

interface Props {
  data: TopSupplierEntry[]
}

export function TopSuppliersChart({ data }: Props) {
  const navigate = useNavigate()
  const names = data.map((d) => d.supplier_name)
  const revenues = data.map((d) => Math.round(d.total_revenue / 1000))

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Top 10 Suppliers by Revenue ($K) — click to view
        </Typography>
        <BarChart
          layout="horizontal"
          yAxis={[{ data: names, scaleType: 'band', tickLabelStyle: { fontSize: 10 } }]}
          xAxis={[{ label: 'Revenue ($K)' }]}
          series={[{ data: revenues, color: '#1976d2' }]}
          height={340}
          margin={{ left: 130, right: 20, bottom: 40 }}
          onItemClick={(_e, { dataIndex }) => {
            const supplier = data[dataIndex]
            if (supplier) navigate(`/suppliers/${supplier.supplier_id}`)
          }}
          sx={{ cursor: 'pointer' }}
        />
      </CardContent>
    </Card>
  )
}
