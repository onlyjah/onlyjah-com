import { Link } from '@tanstack/react-router'
import entries from '../content/dictionary.json'
import { dictionaryLinks } from '../lib/dictionary'

export function DictionaryText({
  text,
  context = 'general',
}: {
  text: string
  context?: 'onlyjah' | 'general'
}) {
  const matches = dictionaryLinks(text, entries.entries, context)
  const parts = matches.map((match, position) => {
    const preceding = text.slice(
      position ? matches[position - 1].end : 0,
      match.start,
    )
    return (
      <span key={`${match.start}-${match.id}`}>
        {preceding}
        <Link to="/docs/words" search={{ word: match.id }}>
          {text.slice(match.start, match.end)}
        </Link>
      </span>
    )
  })
  return (
    <>
      {parts}
      {text.slice(matches.length ? matches[matches.length - 1].end : 0)}
    </>
  )
}
