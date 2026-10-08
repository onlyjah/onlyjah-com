import { createDataApi, type DataApiOptions } from '../publishing/data-api.ts'
import { createPostClient } from '../publishing/post-client.ts'
export type Reference = {
  id: string
  kind: string
  title: string
  excerpt: string
}
export function createReferenceClient(options: DataApiOptions) {
  const request = createDataApi(options)
  return {
    async search(
      word: string,
      userId: string,
      signal?: AbortSignal,
    ): Promise<Reference[]> {
      if (!word.trim() || word.length > 100)
        throw new Error('Choose a word or short phrase.')
      await createPostClient(options).access(userId)
      return (
        await request('rpc/dictionary_references', {
          method: 'POST',
          body: JSON.stringify({ search_text: word }),
          signal,
        })
      ).json()
    },
  }
}
