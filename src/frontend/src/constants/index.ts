export const ORDER_STATUSES = ['pending', 'approved', 'rejected', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = typeof ORDER_STATUSES[number]

export const ORDER_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export type OrderPriority = typeof ORDER_PRIORITIES[number]

export const WAREHOUSES = [
  'warehouse_east',
  'warehouse_west',
  'warehouse_north',
  'warehouse_south',
  'warehouse_central',
  'unassigned',
] as const

export const BULK_ACTIONS = ['approve', 'reject', 'flag'] as const
export type BulkAction = typeof BULK_ACTIONS[number]

// ── MUI chip colors ──────────────────────────────────────────────────────────

export const STATUS_CHIP_COLORS: Record<OrderStatus, 'default' | 'warning' | 'error' | 'info' | 'success' | 'primary'> = {
  pending: 'warning',
  approved: 'primary',
  rejected: 'error',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'default',
}

export const PRIORITY_CHIP_COLORS: Record<string, 'default' | 'warning' | 'error' | 'info' | 'success' | 'primary'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'error',
}

// ── Chart colors ─────────────────────────────────────────────────────────────

export const STATUS_CHART_COLORS: Record<string, string> = {
  pending: '#ed6c02',
  approved: '#1565c0',
  rejected: '#d32f2f',
  shipped: '#0288d1',
  delivered: '#2e7d32',
  cancelled: '#757575',
}

export const CHART_PRIMARY_COLOR = '#1565c0'
export const CHART_SECONDARY_COLOR = '#2e7d32'
export const CHART_INFO_COLOR = '#0288d1'

// ── Layout ───────────────────────────────────────────────────────────────────

export const DRAWER_WIDTH = 220

// ── Formatting thresholds ────────────────────────────────────────────────────

export const MILLION = 1_000_000
export const THOUSAND = 1_000
export const REVENUE_K_DIVISOR = 1_000

// ── Timing (ms) ──────────────────────────────────────────────────────────────

export const JOB_POLL_INTERVAL_MS = 500
export const SNACKBAR_DURATION_MS = 5_000