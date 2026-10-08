import { useAuth } from '@clerk/react'
import { useEffect, useState } from 'react'
import { MemberGate } from '../auth/member-gate'
import { createReferenceClient, type Reference } from './reference-client'

function LoadedReferences({ word }: { word: string }) {
  const { userId, getToken } = useAuth()
  const [state, setState] = useState<{
    word: string
    userId: string
    rows: Reference[]
    error: string
  } | null>(null)
  const url = import.meta.env.VITE_NEON_DATA_API_URL
  useEffect(() => {
    if (!userId || !url) return
    const controller = new AbortController()
    createReferenceClient({ url, getToken })
      .search(word, userId, controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted)
          setState({ word, userId, rows, error: '' })
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState({
            word,
            userId,
            rows: [],
            error:
              'Private references could not be loaded. Check your Forge access.',
          })
      })
    return () => controller.abort()
  }, [word, userId, getToken])
  if (!url)
    return <p>Forge reference search is not configured in this environment.</p>
  if (!state || state.word !== word || state.userId !== userId)
    return <p role="status">Checking your Forge references…</p>
  if (state.error) return <p role="alert">{state.error}</p>
  return (
    <div>
      <p>
        {state.rows.length} accessible references
        {state.rows.length === 30 ? ' (first 30)' : ''}
      </p>
      {state.rows.map((row) => (
        <article key={`${row.kind}-${row.id}`}>
          <h3>{row.title}</h3>
          <p>{row.excerpt}</p>
          <a href="/forge">Open Forge</a>
        </article>
      ))}
    </div>
  )
}
export function PrivateReferences({ word }: { word: string }) {
  return (
    <section>
      <h3>Your Forge documents and notes</h3>
      <MemberGate>
        <LoadedReferences word={word} />
      </MemberGate>
    </section>
  )
}
