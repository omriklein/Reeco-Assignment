import { DataGrid, type GridColDef, type GridSortModel, type GridRowSelectionModel } from '@mui/x-data-grid'
import { Chip, Link } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { STATUS_CHIP_COLORS, PRIORITY_CHIP_COLORS } from '../../constants'
import type { Order } from '../../api/types'
import type { OrderStatus } from '../../constants'

interface Props {
  rows: Order[]
  total: number
  page: number
  pageSize: number
  sortModel: GridSortModel
  selectionModel: GridRowSelectionModel
  loading: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSortChange: (model: GridSortModel) => void
  onSelectionChange: (model: GridRowSelectionModel) => void
}

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'Order ID',
    width: 120,
    renderCell: ({ value }) => (
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' }}>{value}</span>
    ),
  },
  {
    field: 'product_name',
    headerName: 'Product',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'supplier_name',
    headerName: 'Supplier',
    flex: 1,
    minWidth: 130,
    renderCell: ({ row }) => (
      <SupplierLink id={row.supplier_id} name={row.supplier_name} />
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 110,
    renderCell: ({ value }) => (
      <Chip label={value} color={STATUS_CHIP_COLORS[value as OrderStatus] ?? 'default'} size="small" />
    ),
  },
  {
    field: 'priority',
    headerName: 'Priority',
    width: 100,
    renderCell: ({ value }) => (
      <Chip label={value} color={PRIORITY_CHIP_COLORS[value] ?? 'default'} size="small" variant="outlined" />
    ),
  },
  {
    field: 'total_price',
    headerName: 'Total',
    width: 110,
    align: 'right',
    headerAlign: 'right',
    renderCell: ({ value }) => (
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem' }}>
        ${Number(value).toLocaleString()}
      </span>
    ),
  },
  { field: 'warehouse', headerName: 'Warehouse', width: 140, renderCell: ({ value }) => value ?? 'unassigned' },
  {
    field: 'created_at',
    headerName: 'Created',
    width: 110,
    renderCell: ({ value }) => dayjs(value).format('YYYY-MM-DD'),
  },
]

function SupplierLink({ id, name }: { id: string; name: string }) {
  const navigate = useNavigate()
  return (
    <Link
      component="button"
      variant="body2"
      onClick={(e) => { e.stopPropagation(); navigate(`/suppliers/${id}`) }}
    >
      {name}
    </Link>
  )
}

export function OrdersTable({
  rows, total, page, pageSize, sortModel, selectionModel, loading,
  onPageChange, onPageSizeChange, onSortChange, onSelectionChange,
}: Props) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      rowCount={total}
      loading={loading}
      paginationMode="server"
      sortingMode="server"
      pageSizeOptions={[20, 50, 100]}
      paginationModel={{ page, pageSize }}
      onPaginationModelChange={({ page: p, pageSize: ps }) => {
        if (p !== page) onPageChange(p)
        if (ps !== pageSize) onPageSizeChange(ps)
      }}
      sortModel={sortModel}
      onSortModelChange={onSortChange}
      checkboxSelection
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={onSelectionChange}
      disableColumnFilter
      autoHeight
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default' },
        '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' },
      }}
    />
  )
}
