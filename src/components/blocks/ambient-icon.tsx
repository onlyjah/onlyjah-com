import { Orbit, Sprout, Sun } from 'lucide-react'

const icons = { orbit: Orbit, sprout: Sprout, sun: Sun }
/** Existing open-source Lucide glyphs, with optional CSS motion; no generated art. */
export function AmbientIcon({
  kind = 'orbit',
  motion = false,
  className = '',
}: {
  kind?: keyof typeof icons
  motion?: boolean
  className?: string
}) {
  const Icon = icons[kind]
  return (
    <Icon
      aria-hidden="true"
      className={`${className} ${motion ? 'motion-safe:animate-[spin_60s_linear_infinite]' : ''}`}
    />
  )
}
