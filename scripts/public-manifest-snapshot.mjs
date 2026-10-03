import { isDeepStrictEqual } from 'node:util'

/** Private-only edits must not republish an unchanged public excerpt snapshot. */
export function publicManifestSnapshot(candidate, previous) {
  if (!previous) return candidate
  const { master_sha256: _newChecksum, ...nextPublic } = candidate
  const { master_sha256: _oldChecksum, ...oldPublic } = previous
  return isDeepStrictEqual(nextPublic, oldPublic) ? previous : candidate
}
