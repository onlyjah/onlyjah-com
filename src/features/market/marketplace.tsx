import { ClientOnly } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { browserPublicApi } from '@/features/publishing/browser-public-api'
import { createDataApi, errorMessage } from '@/features/publishing/data-api'

type Listing = {
  id: string
  organization: string
  title: string
  description: string
  price_label: string
  artist_slug: string
  author_name: string
  kind: string
  product_type: string
}
function Loaded() {
  const [rows, setRows] = useState<Listing[]>([])
  const [message, setMessage] = useState('Loading listings…')
  useEffect(() => {
    if (!import.meta.env.VITE_NEON_DATA_API_URL) {
      setMessage('The market is not connected yet.')
      return
    }
    const controller = new AbortController()
    createDataApi(browserPublicApi)(
      'market_listings?status=eq.published&select=id,organization,title,description,price_label,kind,product_type,artist_slug,author_name&limit=50',
      { signal: controller.signal },
      false,
    )
      .then((response) => response.json())
      .then((listings: Listing[]) => {
        if (!controller.signal.aborted) {
          setRows(listings)
          setMessage(listings.length ? '' : 'No listings published yet.')
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setMessage(errorMessage(cause))
      })
    return () => controller.abort()
  }, [])
  if (!rows.length) return <p role="status">{message}</p>
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((row) => (
        <Card key={row.id}>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{row.kind}</Badge>
              {row.product_type !== 'other' && (
                <Badge variant="outline">{row.product_type}</Badge>
              )}
            </div>
            {row.artist_slug && (
              <a
                className="text-sm text-primary underline"
                href={`/artist?name=${encodeURIComponent(row.artist_slug)}`}
              >
                {row.author_name}
              </a>
            )}
            <CardTitle>
              <h2>{row.title}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap">{row.description}</p>
            <p className="font-medium">{row.price_label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
export function Marketplace() {
  return (
    <ClientOnly fallback={<p>Live OnlyJah listings</p>}>
      <Loaded />
    </ClientOnly>
  )
}
