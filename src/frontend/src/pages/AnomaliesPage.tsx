import { Typography, Card, CardContent, Chip, Box, Stack } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { getAnomalies } from '../api/orders'
import { LoadingState } from '../components/shared/LoadingState'
import { ErrorState } from '../components/shared/ErrorState'
import { EmptyState } from '../components/shared/EmptyState'
import type { Severity } from '../api/types'

const SEVERITY_CHIP_COLOR: Record<Severity, 'info' | 'warning' | 'error'> = {
  low: 'info',
  medium: 'warning',
  high: 'error',
}

export function AnomaliesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['anomalies'],
    queryFn: getAnomalies,
    staleTime: 60_000,
  })

  if (isLoading) return <LoadingState message="Scanning for anomalies..." />
  if (isError) return <ErrorState message="Failed to load anomalies." onRetry={refetch} />
  if (!data?.data.length) return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Anomalies</Typography>
      <EmptyState message="No anomalies detected." />
    </>
  )

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Anomalies</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {data.data.length} flagged orders
      </Typography>

      <Stack spacing={1}>
        {data.data.map((a) => (
          <Card key={a.order_id} variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                  {a.order_id}
                </Typography>
                <Chip
                  label={a.severity}
                  color={SEVERITY_CHIP_COLOR[a.severity]}
                  size="small"
                  sx={{ textTransform: 'uppercase', fontWeight: 600 }}
                />
                {a.anomaly_types.map((t) => (
                  <Chip key={t} label={t} size="small" variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  )
}