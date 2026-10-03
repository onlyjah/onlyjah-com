import { type PostInput, validatePost } from './post-client.ts'

export function draftBackup(input: PostInput) {
  return JSON.stringify(
    { format: 'onlyjah-forge-draft', version: 1, input },
    null,
    2,
  )
}

export function readDraftBackup(text: string): PostInput {
  const data = JSON.parse(text)
  if (data?.format !== 'onlyjah-forge-draft' || data.version !== 1)
    throw new Error('Choose a Forge draft backup, version 1.')
  const value = data.input
  if (
    !value ||
    typeof value.title !== 'string' ||
    typeof value.body !== 'string'
  )
    throw new Error('The backup is missing its title or body.')
  for (const key of ['embed_urls', 'gallery_urls', 'tags']) {
    if (
      !Array.isArray(value[key]) ||
      value[key].some((v: unknown) => typeof v !== 'string')
    )
      throw new Error('The backup has invalid links or tags.')
  }
  const input: PostInput = {
    title: value.title,
    body: value.body,
    kind: value.kind,
    target: value.target,
    embed_urls: value.embed_urls,
    gallery_urls: value.gallery_urls,
    tags: value.tags,
  }
  validatePost(input)
  return input
}
