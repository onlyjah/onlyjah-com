import {
  createDataApi,
  DataApiError,
  type DataApiOptions,
} from '../publishing/data-api.ts'
import { assertUuid } from '../publishing/post-client.ts'

export type WorkspaceInput = {
  kind: string
  title: string
  body: string
  status: 'draft' | 'active' | 'completed' | 'published'
  links: string[]
  editor_ids: string[]
  price_label: string
}
export type WorkspaceItem = WorkspaceInput & {
  id: string
  revision: number
  owner_id: string
}
export const itemKinds = [
  'project',
  'document',
  'task',
  'request',
  'offering',
  'swap',
]
export const marketKinds = ['offering', 'request', 'swap']

export function createItemClient(
  options: DataApiOptions,
  scope: 'forge' | 'market',
) {
  const request = createDataApi(options)
  const table = scope === 'forge' ? 'forge_items' : 'market_listings'
  function normalize(row: Record<string, unknown>): WorkspaceItem {
    return {
      ...row,
      body: row.body ?? row.description ?? '',
      links: row.links ?? [],
      editor_ids: row.editor_ids ?? [],
      price_label: row.price_label ?? '',
    } as WorkspaceItem
  }
  return {
    async list(userId: string, signal?: AbortSignal): Promise<WorkspaceItem[]> {
      const filter =
        scope === 'market' ? `&owner_id=eq.${encodeURIComponent(userId)}` : ''
      const rows: Record<string, unknown>[] = await (
        await request(
          `${table}?select=*&order=updated_at.desc&limit=100${filter}`,
          { signal },
        )
      ).json()
      return rows.map(normalize)
    },
    async save(
      input: WorkspaceInput,
      saved?: Pick<WorkspaceItem, 'id' | 'revision'>,
    ): Promise<WorkspaceItem> {
      if (
        !input.title.trim() ||
        input.title.length > 160 ||
        input.body.length > (scope === 'market' ? 5000 : 100000)
      )
        throw new Error('Check the title and document length before saving.')
      const kinds = scope === 'forge' ? itemKinds : marketKinds
      const statuses =
        scope === 'forge'
          ? ['draft', 'active', 'completed']
          : ['draft', 'published']
      if (!kinds.includes(input.kind) || !statuses.includes(input.status))
        throw new Error('Choose a valid item type and status.')
      if (
        input.price_label.length > 100 ||
        input.editor_ids.length > 20 ||
        input.links.length > 12 ||
        input.links.join(',').length > 24576
      )
        throw new Error('Too many collaborators or links.')
      if (input.editor_ids.some((id) => !/^user_[A-Za-z0-9_]+$/.test(id)))
        throw new Error('Use verified account IDs for collaborators.')
      for (const value of input.links) {
        const url = new URL(value)
        if (url.protocol !== 'https:' || url.username || url.password)
          throw new Error('Use HTTPS links without credentials.')
      }
      // No owner, organization, permission, attribution or billing fields come from the caller.
      const body =
        scope === 'forge'
          ? {
              kind: input.kind,
              title: input.title.trim(),
              body: input.body,
              status: input.status,
              links: input.links,
              editor_ids: input.editor_ids,
            }
          : {
              kind: input.kind,
              title: input.title.trim(),
              description: input.body,
              status: input.status,
              price_label: input.price_label,
            }
      let path = table
      if (saved) {
        assertUuid(saved.id)
        if (!Number.isInteger(saved.revision) || saved.revision < 1)
          throw new Error('Invalid item revision.')
        path += `?id=eq.${saved.id}&revision=eq.${saved.revision}`
      }
      const rows: Record<string, unknown>[] = await (
        await request(path, {
          method: saved ? 'PATCH' : 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        })
      ).json()
      if (rows.length !== 1)
        throw new DataApiError(
          'conflict',
          'This item changed. Reload the saved version before editing.',
        )
      return normalize(rows[0])
    },
  }
}
