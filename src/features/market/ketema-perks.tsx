import { useAuth } from '@clerk/react'
import { ClientOnly } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authConfigured } from '@/features/auth/provider'
import { createDataApi, errorMessage } from '@/features/publishing/data-api'
import { createPostClient } from '@/features/publishing/post-client'

type Perk = {
  listing_id: string
  details: string
  market_listings: { title: string }
}
function Loaded() {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth()
  const [rows, setRows] = useState<Perk[]>([])
  const [message, setMessage] = useState('')
  useEffect(() => {
    setRows([])
    setMessage('')
    const url = import.meta.env.VITE_NEON_DATA_API_URL
    if (!isLoaded || !isSignedIn || !userId || !url) return
    const controller = new AbortController()
    createPostClient({ url, getToken })
      .access(userId)
      .then(async (access) => {
        if (controller.signal.aborted) return
        if (!access.ketema) {
          setMessage('Ketema perks are available by invitation.')
          return
        }
        const response = await createDataApi({ url, getToken })(
          'ketema_perks?select=listing_id,details,market_listings(title)&limit=50',
          { signal: controller.signal },
        )
        const perks: Perk[] = await response.json()
        if (!controller.signal.aborted) {
          setRows(perks)
          setMessage(perks.length ? '' : 'No Ketema perks listed yet.')
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setMessage(errorMessage(cause))
      })
    return () => controller.abort()
  }, [isLoaded, isSignedIn, userId, getToken])
  if (!isSignedIn) return null
  return (
    <section className="space-y-4" aria-label="Ketema perks">
      <h2 className="text-xl font-semibold">Ketema perks</h2>
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
      {rows.map((perk) => (
        <Card key={perk.listing_id}>
          <CardHeader>
            <CardTitle>
              <h3>{perk.market_listings?.title || 'Member perk'}</h3>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{perk.details}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
export function KetemaPerks() {
  if (!authConfigured) return null
  return (
    <ClientOnly fallback={null}>
      <Loaded />
    </ClientOnly>
  )
}
