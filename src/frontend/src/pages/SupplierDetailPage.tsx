import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Button, Box } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useQuery } from '@tanstack/react-query'
import { getSupplier, getSupplierPerformance } from '../api/suppliers'
import { getOrders } from '../api/orders'
import { SupplierInfo } from '../components/suppliers/SupplierInfo'
import { SupplierPerformance } from '../components/suppliers/SupplierPerformance'
import { OrdersTable } from '../components/orders/OrdersTable'
import { LoadingState } from '../components/shared/LoadingState'
import { ErrorState } from '../components/shared/ErrorState'
import { EmptyState } from '../components/shared/EmptyState'
import { useSSE } from '../hooks/useSSE'
import { useState } from 'react'
import { type GridSortModel, type GridRowSelectionModel } from '@mui/x-data-grid'

const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set() }

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [selection, setSelection] = useState<GridRowSelectionModel>(EMPTY_SELECTION)

  useSSE(id)

  const supplierQ = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplier(id!),
    enabled: !!id,
  })

  const perfQ = useQuery({
    queryKey: ['supplier-perf', id],
    queryFn: () => getSupplierPerformance(id!),
    enabled: !!id,
  })

  const ordersQ = useQuery({
    queryKey: ['orders', { supplier_id: id, page, pageSize }],
    queryFn: () => getOrders({ supplier_id: id, limit: pageSize, offset: page * pageSize }),
    enabled: !!id,
    placeholderData: (prev) => prev,
  })

  if (supplierQ.isLoading || perfQ.isLoading) return <LoadingState message="Loading supplier..." />
  if (supplierQ.isError) return <ErrorState message="Supplier not found." onRetry={() => navigate(-1)} />

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      {supplierQ.data && <SupplierInfo supplier={supplierQ.data} />}
      {perfQ.data && <SupplierPerformance perf={perfQ.data} />}

      <Box mb={1}>
        <Typography variant="h6" fontWeight={600}>Order History</Typography>
      </Box>

      {ordersQ.isError ? (
        <ErrorState message="Failed to load orders." onRetry={ordersQ.refetch} />
      ) : !ordersQ.isLoading && ordersQ.data?.data.length === 0 ? (
        <EmptyState message="No orders for this supplier." />
      ) : (
        <OrdersTable
          rows={ordersQ.data?.data ?? []}
          total={ordersQ.data?.total ?? 0}
          page={page}
          pageSize={pageSize}
          sortModel={sortModel}
          selectionModel={selection}
          loading={ordersQ.isLoading}
          onPageChange={setPage}
          onPageSizeChange={(ps) => { setPageSize(ps); setPage(0) }}
          onSortChange={setSortModel}
          onSelectionChange={setSelection}
        />
      )}
    </>
  )
}
