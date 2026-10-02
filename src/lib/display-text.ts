// Original quotations stay in the archive. These are Jah-authorized display changes.
export function displayText(text: string) {
  return text
    .replace(/\u2014|---/g, '-')
    .replace(/\bflow through\b/gi, (value) =>
      value.startsWith('F') ? 'Flowthrough' : 'flowthrough',
    )
}

type MarkdownNode = {
  type: string
  value?: string
  children?: MarkdownNode[]
}

export function remarkDisplayText() {
  return (tree: MarkdownNode) => {
    function visit(node: MarkdownNode) {
      // Text nodes exclude code, URLs and thematic breaks.
      if (node.type === 'text' && typeof node.value === 'string')
        node.value = displayText(node.value)
      for (const child of node.children ?? []) visit(child)
    }
    visit(tree)
  }
}
