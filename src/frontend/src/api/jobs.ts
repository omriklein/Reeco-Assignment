import { apiFetch } from './client'
import type { Job } from './types'

export function getJob(id: string): Promise<Job> {
  return apiFetch(`/jobs/${id}`)
}

export type { Job }
