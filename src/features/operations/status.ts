export type WorkState =
  | 'prepared'
  | 'verified'
  | 'staged'
  | 'blocked'
  | 'unverified'

export const stateLabels: Record<WorkState, string> = {
  prepared: 'Prepared locally',
  verified: 'Checks passed',
  staged: 'Staged at provider',
  blocked: 'Blocked',
  unverified: 'Not verified live',
}

// An observation is evidence at one instant, never a live health assertion.
export function snapshotAge(observedAt: string, now: number) {
  const observed = Date.parse(observedAt)
  if (!Number.isFinite(observed) || observed > now + 60_000) return 'unknown'
  return now - observed > 15 * 60_000 ? 'stale' : 'recent'
}

export function deploymentLabel(status: string) {
  switch (status) {
    case 'INITIALIZING':
      return 'Initializing'
    case 'SUCCESS':
      return 'Provider reported success; application verification required'
    case 'FAILED':
      return 'Failed'
    case 'CRASHED':
      return 'Crashed'
    case 'BUILDING':
      return 'Building'
    case 'DEPLOYING':
      return 'Deploying'
    default:
      return 'Unknown provider state'
  }
}
