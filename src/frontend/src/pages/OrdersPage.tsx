import { useState } from 'react'
import { Typography } from '@mui/material'
import { type GridSortModel, type GridRowSelectionModel } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { getOrders } from '../api/orders'
import { getSuppliers } from '../api/suppliers'
import { OrderFilters } from '../components/orders/OrderFilters'
import { OrdersTable } from '../components/orders/OrdersTable'
import { BulkActionBar } from '../components/orders/BulkActionBar'
import { ErrorState } from '../components/shared/ErrorState'
import { EmptyState } from '../components/shared/EmptyState'
import { useSSE } from '../hooks/useSSE'
import type { OrderFilters as Filters } from '../api/types'

const DEFAULT_FILTERS: Filters = { limit: 20, offset: 0 }
const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set() }

export function OrdersPage() {
  useSSE()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [selection, setSelection] = useState<GridRowSelectionModel>(EMPTY_SELECTION)

  const selectedIds = Array.from(selection.ids) as string[]

  const activeFilters: Filters = {
    ...filters,
    limit: pageSize,
    offset: page * pageSize,
    sort: sortModel[0]?.field,
    order: sortModel[0]?.sort ?? undefined,
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders', activeFilters],
    queryFn: () => getOrders(activeFilters),
    placeholderData: (prev) => prev,
  })

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () => getSuppliers(500),
    staleTime: 60_000,
  })

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS)
    setPage(0)
    setSortModel([])
    setSelection(EMPTY_SELECTION)
  }

  const handleFilterChange = (f: Filters) => {
    setFilters(f)
    setPage(0)
    setSelection(EMPTY_SELECTION)
  }

  if (isError) return <ErrorState message="Failed to load orders." onRetry={refetch} />

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Orders</Typography>

      <OrderFilters
        filters={filters}
        suppliers={suppliersData?.data ?? []}
        onChange={handleFilterChange}
        onClear={handleClear}
      />

      {selectedIds.length > 0 && (
        <BulkActionBar
          selectedIds={selectedIds}
          onDone={() => setSelection(EMPTY_SELECTION)}
        />
      )}

      {!isLoading && data?.data.length === 0 ? (
        <EmptyState message="No orders match your filters." />
      ) : (
        <OrdersTable
          rows={data?.data ?? []}
          total={data?.total ?? 0}
          page={page}
          pageSize={pageSize}
          sortModel={sortModel}
          selectionModel={selection}
          loading={isLoading}
          onPageChange={setPage}
          onPageSizeChange={(ps) => { setPageSize(ps); setPage(0) }}
          onSortChange={setSortModel}
          onSelectionChange={setSelection}
        />
      )}
    </>
  )
}
