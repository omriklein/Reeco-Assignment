import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useSSE(supplierId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const url = supplierId ? `/api/events?supplier_id=${supplierId}` : '/api/events'
    const es = new EventSource(url)

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'order_updated') {
          queryClient.invalidateQueries({ queryKey: ['orders'] })
          queryClient.invalidateQueries({ queryKey: ['order', event.data.id] })
          queryClient.invalidateQueries({ queryKey: ['stats'] })
        } else if (event.type === 'bulk_completed') {
          queryClient.invalidateQueries({ queryKey: ['orders'] })
          queryClient.invalidateQueries({ queryKey: ['job', event.data.jobId] })
          queryClient.invalidateQueries({ queryKey: ['stats'] })
        }
      } catch {}
    }

    return () => es.close()
  }, [queryClient, supplierId])
}
