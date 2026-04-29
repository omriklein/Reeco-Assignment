import {
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Pagination,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FilterListIcon from '@mui/icons-material/FilterList'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { getAnomalies } from '../api/orders'
import { LoadingState } from '../components/shared/LoadingState'
import { ErrorState } from '../components/shared/ErrorState'
import { EmptyState } from '../components/shared/EmptyState'
import { ANOMALY_TYPES, SEVERITIES, ANOMALY_TYPE_LABELS } from '../constants'
import type { Severity } from '../api/types'
import type { PaletteColor } from '@mui/material'

type SeverityPaletteKey = 'info' | 'warning' | 'error'

const SEVERITY_PALETTE: Record<Severity, SeverityPaletteKey> = {
  low: 'info',
  medium: 'warning',
  high: 'error',
}

const SEVERITY_ICON: Record<Severity, React.ReactNode> = {
  low: <InfoOutlinedIcon sx={{ fontSize: 13 }} />,
  medium: <WarningAmberIcon sx={{ fontSize: 13 }} />,
  high: <ErrorOutlinedIcon sx={{ fontSize: 13 }} />,
}

const PAGE_SIZE = 25

function SeverityBadge({ severity }: { severity: Severity }) {
  const theme = useTheme()
  const paletteKey = SEVERITY_PALETTE[severity]
  const color = (theme.palette[paletteKey] as PaletteColor).main
  const bg = alpha(color, 0.12)

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: bg,
        color: color,
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {SEVERITY_ICON[severity]}
      {severity}
    </Box>
  )
}

function AnomalyCard({ a }: { a: { order_id: string; severity: Severity; anomaly_types: string[] } }) {
  const theme = useTheme()
  const paletteKey = SEVERITY_PALETTE[a.severity]
  const borderColor = (theme.palette[paletteKey] as PaletteColor).main

  return (
    <Card
      sx={{
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: theme.shadows[4] },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 500,
              fontSize: '0.82rem',
              color: 'text.primary',
              minWidth: 120,
            }}
          >
            {a.order_id}
          </Typography>

          <SeverityBadge severity={a.severity} />

          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {a.anomaly_types.map((t) => (
              <Chip
                key={t}
                label={ANOMALY_TYPE_LABELS[t] ?? t}
                size="small"
                variant="outlined"
                sx={{ color: 'text.secondary', fontSize: '0.7rem', height: 22 }}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export function AnomaliesPage() {
  const [severity, setSeverity] = useState<Severity | ''>('')
  const [anomalyType, setAnomalyType] = useState('')
  const [page, setPage] = useState(1)

  const activeFilters = useMemo(() => ({
    ...(severity ? { severity } : {}),
    ...(anomalyType ? { anomaly_type: anomalyType } : {}),
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  }), [severity, anomalyType, page])

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['anomalies', activeFilters],
    queryFn: () => getAnomalies(activeFilters),
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  })

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const pageCount = Math.ceil(total / PAGE_SIZE)
  const highCount = items.filter((a) => a.severity === 'high').length
  const medCount = items.filter((a) => a.severity === 'medium').length

  const hasFilters = severity !== '' || anomalyType !== ''

  function resetFilters() {
    setSeverity('')
    setAnomalyType('')
    setPage(1)
  }

  function handleSeverityChange(val: string) {
    setSeverity(val as Severity | '')
    setPage(1)
  }

  function handleAnomalyTypeChange(val: string) {
    setAnomalyType(val)
    setPage(1)
  }

  return (
    <>
      <PageHeader
        total={total}
        highCount={highCount}
        medCount={medCount}
        isFetching={isFetching && !isLoading}
      />

      {/* Filter bar */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <FilterListIcon sx={{ color: 'text.secondary', fontSize: 18 }} />

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Severity</InputLabel>
          <Select
            label="Severity"
            value={severity}
            onChange={(e) => handleSeverityChange(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {SEVERITIES.map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Anomaly Type</InputLabel>
          <Select
            label="Anomaly Type"
            value={anomalyType}
            onChange={(e) => handleAnomalyTypeChange(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {ANOMALY_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{ANOMALY_TYPE_LABELS[t]}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasFilters && (
          <Button size="small" variant="text" onClick={resetFilters} sx={{ color: 'text.secondary' }}>
            Reset
          </Button>
        )}
      </Box>

      {isError && <ErrorState message="Failed to load anomalies." onRetry={refetch} />}

      {isLoading ? (
        <LoadingState message="Scanning for anomalies…" />
      ) : items.length === 0 ? (
        <EmptyState message="No anomalies detected." />
      ) : (
        <>
          <Stack spacing={1}>
            {items.map((a) => (
              <AnomalyCard key={a.order_id} a={a} />
            ))}
          </Stack>

          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                size="small"
              />
            </Box>
          )}
        </>
      )}
    </>
  )
}

function PageHeader({
  total,
  highCount,
  medCount,
  isFetching,
}: {
  total: number
  highCount: number
  medCount: number
  isFetching: boolean
}) {
  const theme = useTheme()
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ mb: 0.25 }}>Anomalies</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 0.75 }}>
        {total > 0 && (
          <Typography variant="body2" color="text.secondary">
            {total} flagged orders
          </Typography>
        )}
        {highCount > 0 && (
          <Chip
            label={`${highCount} high`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: theme.palette.error.main,
              fontWeight: 700,
              height: 20,
              fontSize: '0.7rem',
            }}
          />
        )}
        {medCount > 0 && (
          <Chip
            label={`${medCount} medium`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.warning.main, 0.12),
              color: theme.palette.warning.dark,
              fontWeight: 700,
              height: 20,
              fontSize: '0.7rem',
            }}
          />
        )}
        {isFetching && (
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
            refreshing…
          </Typography>
        )}
      </Box>
    </Box>
  )
}
