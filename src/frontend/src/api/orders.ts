import { apiFetch, buildQueryString } from './client'
import type { Order, PaginatedResponse, OrderStats, Anomaly, AnomalyResponse, OrderFilters } from './types'
import type { BulkAction } from '../constants'

export function getOrders(filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> {
  const qs = buildQueryString(filters as Record<string, string | number | boolean | undefined | null>)
  return apiFetch(`/orders${qs}`)
}

export function getOrder(id: string): Promise<Order> {
  return apiFetch(`/orders/${id}`)
}

export function patchOrder(id: string, body: { status?: string; priority?: string }): Promise<Order> {
  return apiFetch(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function getOrderStats(): Promise<OrderStats> {
  return apiFetch('/orders/stats')
}

export function getAnomalies(): Promise<AnomalyResponse> {
  return apiFetch('/orders/anomalies')
}

export function bulkAction(orderIds: string[], action: BulkAction, reason?: string): Promise<{ jobId: string }> {
  return apiFetch('/orders/bulk-action', {
    method: 'POST',
    body: JSON.stringify({ orderIds, action, reason }),
  })
}

export type { Order, Anomaly }
