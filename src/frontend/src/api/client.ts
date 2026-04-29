import axiosInstance from './axiosInstance'

export { ApiError } from './errors'

export async function apiFetch<T>(
  path: string,
  options?: { method?: string; body?: string },
): Promise<T> {
  const res = await axiosInstance.request<T>({
    url: path,
    method: options?.method ?? 'GET',
    data: options?.body,
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
  })
  return res.data
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (!entries.length) return ''
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
}