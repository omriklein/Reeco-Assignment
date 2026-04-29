import {
  Box, TextField, MenuItem, Select, FormControl, InputLabel, OutlinedInput,
  Checkbox, ListItemText, Button, InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { ORDER_STATUSES, ORDER_PRIORITIES, WAREHOUSES } from '../../constants'
import type { OrderFilters as Filters } from '../../api/types'
import type { Supplier } from '../../api/types'

interface Props {
  filters: Filters
  suppliers: Supplier[]
  onChange: (filters: Filters) => void
  onClear: () => void
}

export function OrderFilters({ filters, suppliers, onChange, onClear }: Props) {
  const set = (key: keyof Filters, value: unknown) => onChange({ ...filters, [key]: value || undefined, offset: 0 })

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2, alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder="Search product name..."
        value={filters.search ?? ''}
        onChange={(e) => set('search', e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
        sx={{ minWidth: 200 }}
      />

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Status</InputLabel>
        <Select
          multiple
          value={filters.status ? filters.status.split(',') : []}
          onChange={(e) => set('status', (e.target.value as string[]).join(','))}
          input={<OutlinedInput label="Status" />}
          renderValue={(sel) => (sel as string[]).join(', ')}
        >
          {ORDER_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              <Checkbox size="small" checked={(filters.status?.split(',') ?? []).includes(s)} />
              <ListItemText primary={s} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={filters.priority ?? ''}
          onChange={(e) => set('priority', e.target.value)}
          label="Priority"
        >
          <MenuItem value="">All</MenuItem>
          {ORDER_PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Supplier</InputLabel>
        <Select
          value={filters.supplier_id ?? ''}
          onChange={(e) => set('supplier_id', e.target.value)}
          label="Supplier"
        >
          <MenuItem value="">All</MenuItem>
          {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Warehouse</InputLabel>
        <Select
          value={filters.warehouse ?? ''}
          onChange={(e) => set('warehouse', e.target.value)}
          label="Warehouse"
        >
          <MenuItem value="">All</MenuItem>
          {WAREHOUSES.map((w) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
        </Select>
      </FormControl>

      <DatePicker
        label="From"
        value={filters.date_from ? dayjs(filters.date_from) : null}
        onChange={(d: Dayjs | null) => set('date_from', d ? d.format('YYYY-MM-DD') : undefined)}
        slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
      />

      <DatePicker
        label="To"
        value={filters.date_to ? dayjs(filters.date_to) : null}
        onChange={(d: Dayjs | null) => set('date_to', d ? d.format('YYYY-MM-DD') : undefined)}
        slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
      />

      <Button size="small" startIcon={<ClearIcon />} onClick={onClear} color="inherit">
        Clear
      </Button>
    </Box>
  )
}
