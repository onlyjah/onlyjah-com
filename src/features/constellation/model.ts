// R01/R02/R09: consume only the public wire contract. This module contains no
// provider hooks, bearer token or private data adapter. Rendering an edge is
// never a grant. Unknown commercial maturity remains explicitly unverified.
export type Stage = 'research' | 'development' | 'production' | 'unverified'
export type PublicProject = {
  id: string
  name: string
  stage: Stage
  quote: string | null
  source: string
  url: string | null
  originId: string | null
}
export type PublicEdge = { source: string; target: string; type: string }
export type PublicSnapshot = {
  schemaVersion: '1.0'
  authorityId: string
  orgId: string
  updatedAt: string
  projects: PublicProject[]
  relationships: PublicEdge[]
  revision?: string
}
const id = /^[a-z][a-z0-9-]{0,63}$/
const stages = ['research', 'development', 'production', 'unverified']
export function publicSnapshot(value: unknown): PublicSnapshot {
  if (!value || typeof value !== 'object')
    throw new Error('Invalid public snapshot')
  const input = value as Record<string, unknown>
  if (
    input.schemaVersion !== '1.0' ||
    input.authorityId !== 'onlyjah-ark' ||
    input.orgId !== 'onlyjah' ||
    typeof input.updatedAt !== 'string' ||
    !Number.isFinite(Date.parse(input.updatedAt)) ||
    !Array.isArray(input.projects) ||
    input.projects.length > 1000 ||
    !Array.isArray(input.relationships) ||
    input.relationships.length > 10000
  )
    throw new Error('Invalid public snapshot scope')
  const seen = new Set<string>()
  const projects: PublicProject[] = input.projects.map((raw) => {
    if (!raw || typeof raw !== 'object') throw new Error('Invalid project')
    const p = raw as Record<string, unknown>
    if (
      typeof p.id !== 'string' ||
      !id.test(p.id) ||
      seen.has(p.id) ||
      typeof p.name !== 'string' ||
      p.name.length > 120 ||
      typeof p.stage !== 'string' ||
      !stages.includes(p.stage) ||
      typeof p.source !== 'string' ||
      (p.quote !== null &&
        (typeof p.quote !== 'string' || p.quote.length > 2000)) ||
      (p.originId !== null &&
        (typeof p.originId !== 'string' || !id.test(p.originId)))
    )
      throw new Error('Invalid public project')
    if (p.url !== null) {
      if (typeof p.url !== 'string') throw new Error('Invalid public link')
      const url = new URL(p.url)
      if (url.protocol !== 'https:' || url.username || url.password)
        throw new Error('Invalid public link')
    }
    seen.add(p.id)
    return {
      id: p.id,
      name: p.name,
      stage: p.stage as Stage,
      quote: p.quote as string | null,
      source: p.source,
      url: p.url as string | null,
      originId: p.originId as string | null,
    }
  })
  const relationships = input.relationships.map((raw) => {
    if (!raw || typeof raw !== 'object') throw new Error('Invalid relationship')
    const e = raw as Record<string, unknown>
    if (
      typeof e.source !== 'string' ||
      typeof e.target !== 'string' ||
      !seen.has(e.source) ||
      !seen.has(e.target) ||
      typeof e.type !== 'string' ||
      !id.test(e.type)
    )
      throw new Error('Unpublished relationship endpoint')
    return { source: e.source, target: e.target, type: e.type }
  })
  if (projects.some((p) => p.originId && !seen.has(p.originId)))
    throw new Error('Unpublished origin')
  return {
    schemaVersion: '1.0',
    authorityId: 'onlyjah-ark',
    orgId: 'onlyjah',
    updatedAt: input.updatedAt,
    projects,
    relationships,
    ...(typeof input.revision === 'string' &&
    /^[a-f0-9]{64}$/.test(input.revision)
      ? { revision: input.revision }
      : {}),
  }
}
export function apiBase(value: string | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/'
    )
      return null
    return url.origin
  } catch {
    return null
  }
}
