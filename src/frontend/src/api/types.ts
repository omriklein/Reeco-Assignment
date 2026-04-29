import type { OrderStatus, OrderPriority } from '../constants'

export type Severity = 'low' | 'medium' | 'high'

export type JobStatus = 'processing' | 'completed' | 'failed'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

export interface Order {
  id: string
  supplier_id: string
  supplier_name: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  status: OrderStatus
  priority: OrderPriority
  created_at: string
  updated_at: string
  warehouse: string | null
  notes: string | null
}

export interface Supplier {
  id: string
  name: string
  email: string
  rating: number
  country: string
  active: boolean
  created_at: string
  order_count?: number
  total_revenue?: number
}

export interface Product {
  id: string
  name: string
  category_id: string
  sku: string
  price: number
}

export interface ByStatusEntry {
  count: number
  total_value: number
}

export interface ByMonthEntry {
  month: string
  order_count: number
  revenue: number
}

export interface TopSupplierEntry {
  supplier_id: string
  supplier_name: string
  total_revenue: number
}

export interface ByWarehouseEntry {
  warehouse: string
  count: number
  total_value: number
}

export interface OrderStats {
  total_orders: number
  total_revenue: number
  avg_order_value: number
  by_status: Record<string, ByStatusEntry>
  by_month: ByMonthEntry[]
  top_suppliers: TopSupplierEntry[]
  by_warehouse: ByWarehouseEntry[]
}

export interface SupplierPerformance {
  avg_delivery_days: number
  rejection_rate: number
  avg_order_value: number
  monthly_trend: { month: string; order_count: number }[]
  price_consistency: number
}

export interface Anomaly {
  order_id: string
  anomaly_types: string[]
  severity: Severity
}

export interface AnomalyFilters {
  severity?: Severity
  anomaly_type?: string
  limit?: number
  offset?: number
}

export interface AnomalyResponse {
  data: Anomaly[]
  total: number
  limit: number
  offset: number
}

export interface Job {
  status: JobStatus
  progress: {
    total: number
    completed: number
    failed: number
  }
}

export interface OrderFilters {
  status?: string
  priority?: string
  supplier_id?: string
  warehouse?: string
  date_from?: string
  date_to?: string
  min_total?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}