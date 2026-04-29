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
  pending: '#d97706',
  approved: '#1b4332',
  rejected: '#dc2626',
  shipped: '#0369a1',
  delivered: '#15803d',
  cancelled: '#9ca3af',
}

export const CHART_PRIMARY_COLOR = '#1b4332'
export const CHART_SECONDARY_COLOR = '#d97706'
export const CHART_INFO_COLOR = '#0369a1'

// ── Layout ───────────────────────────────────────────────────────────────────

export const DRAWER_WIDTH = 220

// ── Formatting thresholds ────────────────────────────────────────────────────

export const MILLION = 1_000_000
export const THOUSAND = 1_000
export const REVENUE_K_DIVISOR = 1_000

// ── Timing (ms) ──────────────────────────────────────────────────────────────

export const JOB_POLL_INTERVAL_MS = 500
export const SNACKBAR_DURATION_MS = 5_000

// ── Anomalies ─────────────────────────────────────────────────────────────────

export const ANOMALY_TYPES = [
  'price_mismatch',
  'inactive_supplier',
  'negative_quantity',
  'timestamp_anomaly',
  'price_spike',
  'after_hours',
  'risky_supplier',
] as const
export type AnomalyTypeValue = typeof ANOMALY_TYPES[number]

export const SEVERITIES = ['low', 'medium', 'high'] as const

export const ANOMALY_TYPE_LABELS: Record<string, string> = {
  price_mismatch: 'Price Mismatch',
  inactive_supplier: 'Inactive Supplier',
  negative_quantity: 'Negative Qty',
  timestamp_anomaly: 'Bad Timestamp',
  price_spike: 'Price Spike',
  after_hours: 'After Hours',
  risky_supplier: 'Risky Supplier',
}