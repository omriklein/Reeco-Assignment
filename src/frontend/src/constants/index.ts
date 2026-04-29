export const ORDER_STATUSES = ['pending', 'approved', 'rejected', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = typeof ORDER_STATUSES[number]

export const ORDER_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export type OrderPriority = typeof ORDER_PRIORITIES[number]

export const WAREHOUSES = ['warehouse_east', 'warehouse_west', 'warehouse_north', 'warehouse_south', 'warehouse_central', 'unassigned'] as const

export const BULK_ACTIONS = ['approve', 'reject', 'flag'] as const
export type BulkAction = typeof BULK_ACTIONS[number]

export const STATUS_COLORS: Record<OrderStatus, 'default' | 'warning' | 'error' | 'info' | 'success' | 'primary'> = {
  pending: 'warning',
  approved: 'primary',
  rejected: 'error',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'default',
}

export const PRIORITY_COLORS: Record<string, 'default' | 'warning' | 'error' | 'info' | 'success' | 'primary'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'error',
}
