import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type ImageCardProps = {
  src: string
  alt: string
  width: number
  height: number
  caption: string
  credit: string
  source: string
  priority?: boolean
  className?: string
  license?: string
  licenseUrl?: string
  imageClassName?: string
}

export function ImageCard({
  src,
  alt,
  width,
  height,
  caption,
  credit,
  source,
  priority,
  className,
  license,
  licenseUrl,
  imageClassName,
}: ImageCardProps) {
  return (
    <Card className={cn('gap-0 overflow-hidden p-0', className)}>
      <figure className="h-full">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          className={cn('aspect-square w-full object-cover', imageClassName)}
        />
        <figcaption className="flex flex-wrap justify-between gap-2 border-t p-4 text-xs text-muted-foreground">
          <span>{caption}</span>
          <a href={source} className="underline underline-offset-4">
            {credit}
            {!licenseUrl && license ? ` · ${license}` : ''}
          </a>
          {licenseUrl && (
            <a href={licenseUrl} className="underline underline-offset-4">
              {license}
            </a>
          )}
        </figcaption>
      </figure>
    </Card>
  )
}
