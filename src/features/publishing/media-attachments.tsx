import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { galleryUrl, mediaEmbed } from './embed'

export function MediaAttachments({
  links,
  images,
}: {
  links: readonly string[]
  images: readonly string[]
}) {
  const [loaded, setLoaded] = useState<Set<string>>(new Set())
  const load = (url: string) =>
    setLoaded((previous) => new Set(previous).add(url))
  return (
    <div className="space-y-4">
      {links.map((link) => {
        const embed = mediaEmbed(link)
        if (!embed) return null
        return (
          <div key={link} className="space-y-2 rounded-xl border bg-card p-4">
            {loaded.has(link) ? (
              <iframe
                title={`${embed.provider} player`}
                src={embed.src}
                className="min-h-[220px] w-full rounded-lg"
                loading="lazy"
                allow="encrypted-media; fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <Button variant="outline" onClick={() => load(link)}>
                Load {embed.provider} player
              </Button>
            )}
            <a
              href={embed.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary underline"
            >
              Open on {embed.provider}
            </a>
          </div>
        )
      })}
      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {images.filter(galleryUrl).map((src, index) => (
            <figure key={src} className="rounded-xl border bg-card p-3">
              {loaded.has(src) ? (
                <img
                  src={src}
                  alt={`Gallery work ${index + 1}`}
                  className="w-full rounded-lg"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Button variant="outline" onClick={() => load(src)}>
                  Load gallery image {index + 1}
                </Button>
              )}
            </figure>
          ))}
        </div>
      )}
      {(links.length > 0 || images.length > 0) && (
        <p className="text-xs text-muted-foreground">
          External media loads when you choose it.
        </p>
      )}
    </div>
  )
}
