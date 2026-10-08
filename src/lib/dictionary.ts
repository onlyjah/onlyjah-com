export interface Entry {
  id: string
  label: string
  language: string
  aliases: string[]
  curated: boolean
  quoteIds: string[]
  related: string[]
  wikipedia: string
  etymonline: string
}
export interface Match {
  start: number
  end: number
  id: string
}
const wordCharacter = /[\p{L}\p{N}_]/u
const escapePattern = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Exact forms, Unicode boundaries, no guessed translations or stemming.
export function occurrences(text: string, aliases: string[]): Match[] {
  const matches: Match[] = []
  for (const alias of aliases) {
    const expression = new RegExp(escapePattern(alias), 'giu')
    for (const match of text.matchAll(expression)) {
      const start = match.index
      const end = start + match[0].length
      if (
        wordCharacter.test(text[start - 1] ?? '') ||
        wordCharacter.test(text[end] ?? '')
      )
        continue
      matches.push({ start, end, id: '' })
    }
  }
  return matches.sort((a, b) => a.start - b.start || b.end - a.end)
}

export function dictionaryLinks(
  text: string,
  entries: Entry[],
  context: 'onlyjah' | 'general' = 'general',
): Match[] {
  const candidates: Match[] = []
  const protectedRanges = [
    ...text.matchAll(/https?:\/\/\S+|www\.\S+|\b[^\s@]+@[^\s@]+\b|`[^`]*`/gu),
  ].map((m) => ({ start: m.index, end: m.index + m[0].length }))
  for (const entry of entries) {
    if (!entry.curated || entry.language !== 'en') continue
    for (const match of occurrences(text, entry.aliases)) {
      if (
        protectedRanges.some(
          (range) => match.start < range.end && match.end > range.start,
        )
      )
        continue
      // A document can explicitly declare its OnlyJah context. Otherwise only
      // distinctive names link; an ordinary "ark" or "purpose" stays ordinary.
      if (
        context !== 'onlyjah' &&
        !['onlyjah', 'flowthrough', 'so-il'].includes(entry.id)
      )
        continue
      candidates.push({ ...match, id: entry.id })
    }
  }
  candidates.sort(
    (a, b) => a.start - b.start || b.end - a.end || a.id.localeCompare(b.id),
  )
  const result: Match[] = []
  for (const match of candidates)
    if (!result.length || match.start >= result[result.length - 1].end)
      result.push(match)
  return result
}

export function entryHref(id: string): string {
  return `/docs/words?word=${encodeURIComponent(id)}`
}
