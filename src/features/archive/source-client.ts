import { createDataApi, type DataApiOptions } from '../publishing/data-api.ts'
export type Source = {
  id: string
  title: string
  original_text: string
  source_kind: 'chat' | 'note' | 'document'
  tags: string[]
  sha256: string
  stored_bytes: number
  created_at: string
}
export type SourceSummary = Omit<Source, 'original_text'>
export type SourceInput = Pick<
  Source,
  'title' | 'original_text' | 'source_kind' | 'tags'
>
export function validateSource(input: SourceInput) {
  if (
    !input.title.trim() ||
    input.title.length > 160 ||
    !input.original_text ||
    new TextEncoder().encode(input.original_text).length > 1000000
  )
    throw new Error(
      'Use a title up to 160 characters and source text up to 1 MB.',
    )
  if (
    !['chat', 'note', 'document'].includes(input.source_kind) ||
    input.tags.length > 30 ||
    input.tags.some((tag) => typeof tag !== 'string') ||
    input.tags.join(',').length > 1000
  )
    throw new Error(
      'Choose a source type and at most 30 tags, totaling 1,000 characters.',
    )
}
export function createSourceClient(options: DataApiOptions) {
  const request = createDataApi(options)
  return {
    async list(signal?: AbortSignal): Promise<SourceSummary[]> {
      return (
        await request(
          'forge_sources?select=id,title,source_kind,tags,sha256,stored_bytes,created_at&order=created_at.desc&limit=100',
          { signal },
        )
      ).json()
    },
    async read(id: string): Promise<Source> {
      if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error('Invalid source ID.')
      const rows = await (
        await request(`forge_sources?select=*&id=eq.${id}&limit=1`)
      ).json()
      if (!rows[0]) throw new Error('Source unavailable.')
      return rows[0]
    },
    async usage(expectedUser: string): Promise<{
      used_bytes: number
      limit_bytes: number
      source_count: number
    }> {
      const data = await (
        await request('rpc/my_archive_usage', { method: 'POST', body: '{}' })
      ).json()
      if (data.user_id !== expectedUser)
        throw new Error('Archive returned an unexpected account.')
      return data
    },
    async save(input: SourceInput): Promise<Source> {
      validateSource(input)
      const result = await (
        await request('rpc/archive_source', {
          method: 'POST',
          body: JSON.stringify({
            source_title: input.title,
            source_text: input.original_text,
            kind: input.source_kind,
            source_tags: input.tags,
          }),
        })
      ).json()
      if (!result?.id)
        throw new Error('The source was not confirmed as stored.')
      return result
    },
  }
}
