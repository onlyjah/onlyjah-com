import { dictionaryLinks, type Entry, entryHref } from './dictionary.ts'

type Node = { type: string; value?: string; url?: string; children?: Node[] }
export function remarkDictionaryLinks(options: {
  entries: Entry[]
  context?: 'onlyjah' | 'general'
}) {
  return (tree: Node) => {
    const walk = (node: Node) => {
      if (
        ['link', 'linkReference', 'code', 'inlineCode', 'html'].includes(
          node.type,
        )
      )
        return
      if (!node.children) return
      node.children = node.children.flatMap((child) => {
        if (child.type !== 'text' || !child.value) {
          walk(child)
          return [child]
        }
        const value = child.value
        const matches = dictionaryLinks(value, options.entries, options.context)
        const parts: Node[] = []
        let offset = 0
        for (const match of matches) {
          if (match.start > offset)
            parts.push({
              type: 'text',
              value: value.slice(offset, match.start),
            })
          parts.push({
            type: 'link',
            url: entryHref(match.id),
            children: [
              { type: 'text', value: value.slice(match.start, match.end) },
            ],
          })
          offset = match.end
        }
        parts.push({ type: 'text', value: value.slice(offset) })
        return parts
      })
    }
    walk(tree)
  }
}
