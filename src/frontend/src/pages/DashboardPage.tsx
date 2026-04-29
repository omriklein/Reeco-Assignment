import { Typography, Grid } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { getOrderStats } from '../api/orders'
import { StatCards } from '../components/dashboard/StatCards'
import { StatusPieChart } from '../components/dashboard/StatusPieChart'
import { MonthlyTrendChart } from '../components/dashboard/MonthlyTrendChart'
import { TopSuppliersChart } from '../components/dashboard/TopSuppliersChart'
import { WarehouseChart } from '../components/dashboard/WarehouseChart'
import { LoadingState } from '../components/shared/LoadingState'
import { ErrorState } from '../components/shared/ErrorState'
import { useSSE } from '../hooks/useSSE'

export function DashboardPage() {
  useSSE()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: getOrderStats,
    staleTime: 30_000,
  })

  if (isLoading) return <LoadingState message="Loading dashboard..." />
  if (isError) return <ErrorState message="Failed to load dashboard stats." onRetry={refetch} />
  if (!data) return null

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Dashboard</Typography>

      <StatCards stats={data} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <StatusPieChart byStatus={data.by_status} />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <WarehouseChart data={data.by_warehouse} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <MonthlyTrendChart data={data.by_month} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TopSuppliersChart data={data.top_suppliers} />
        </Grid>
      </Grid>
    </>
  )
}