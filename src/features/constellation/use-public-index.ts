import { useEffect, useState } from 'react'
import { apiBase, publicSnapshot } from './model'
import { readPublicCache, writePublicCache } from './public-cache'
import staticSnapshot from './public-snapshot.json'

const initial = publicSnapshot(staticSnapshot)
export const publicApi = apiBase(import.meta.env.VITE_ARK_PUBLIC_API_URL)
export function usePublicIndex() {
  const [snapshot, setSnapshot] = useState(initial)
  const [status, setStatus] = useState('Static public snapshot')
  useEffect(() => {
    let disposed = false
    let stream: EventSource | null = null
    let inFlight = false
    let networkSucceeded = false
    let revision = initial.revision
    let etag: string | null = null
    const scope = publicApi ?? 'static-public-onlyjah'
    void readPublicCache(scope).then((cached) => {
      if (cached && !disposed && !networkSucceeded) {
        revision = cached.revision
        setSnapshot(cached)
        setStatus('Cached public snapshot')
      }
    })
    async function refresh() {
      if (!publicApi || disposed || inFlight) return
      inFlight = true
      try {
        const response = await fetch(`${publicApi}/api/v1/public/catalogue`, {
          credentials: 'omit',
          headers: etag ? { 'If-None-Match': etag } : {},
          signal: AbortSignal.timeout(8000),
        })
        if (response.status === 304) {
          if (!disposed) setStatus('Live public snapshot')
          return
        }
        if (!response.ok) throw new Error('Public index unavailable')
        const next = publicSnapshot(await response.json())
        etag = response.headers.get('ETag')
        revision = next.revision
        networkSucceeded = true
        if (!disposed) {
          setSnapshot(next)
          setStatus('Live public snapshot')
        }
        await writePublicCache(scope, next)
      } catch {
        if (!disposed)
          setStatus('Offline or unavailable · public snapshot retained')
      } finally {
        inFlight = false
      }
    }
    function connect() {
      stream?.close()
      stream = null
      if (!publicApi || disposed || document.hidden) return
      void refresh()
      stream = new EventSource(`${publicApi}/api/v1/public/events`)
      stream.onopen = () => {
        void refresh()
      }
      stream.addEventListener('revision', (event) => {
        try {
          const incoming = JSON.parse((event as MessageEvent).data)
          if (incoming.revision !== revision) void refresh()
        } catch {
          /* Invalid notifications cannot replace the validated snapshot. */
        }
      })
      stream.onerror = () => {
        if (!disposed) setStatus('Reconnecting · public snapshot retained')
      }
    }
    // R08: hidden tabs stop streams; no background polling or global broker.
    function visibility() {
      if (document.hidden) {
        stream?.close()
        stream = null
      } else connect()
    }
    function online() {
      connect()
    }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('online', online)
    connect()
    return () => {
      disposed = true
      stream?.close()
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('online', online)
    }
  }, [])
  return { snapshot, status }
}
