import type { PostInput } from './post-client'

export function downloadPost(post: Pick<PostInput, 'title' | 'body'>) {
  const blob = new Blob([`# ${post.title}\n\n${post.body}\n`], {
    type: 'text/markdown;charset=utf-8',
  })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = `${post.title.replace(/[^a-z0-9]+/gi, '-').slice(0, 80) || 'draft'}.md`
  link.click()
  URL.revokeObjectURL(href)
}
