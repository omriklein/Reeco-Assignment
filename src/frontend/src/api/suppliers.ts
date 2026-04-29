import { apiFetch, buildQueryString } from './client'
import type { Supplier, PaginatedResponse, SupplierPerformance } from './types'

export function getSuppliers(limit = 200, offset = 0): Promise<PaginatedResponse<Supplier>> {
  return apiFetch(`/suppliers${buildQueryString({ limit, offset })}`)
}

export function getSupplier(id: string): Promise<Supplier> {
  return apiFetch(`/suppliers/${id}`)
}

export function getSupplierPerformance(id: string): Promise<SupplierPerformance> {
  return apiFetch(`/suppliers/${id}/performance`)
}

export type { Supplier, SupplierPerformance }
