import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import release from './release.json'
import {
  deploymentLabel,
  snapshotAge,
  stateLabels,
  type WorkState,
} from './status'

const railwayUrl = 'https://railway.com/dashboard'

export function OperationsPanel() {
  const [now, setNow] = useState<number>()
  const [filter, setFilter] = useState<'all' | 'blocked'>('all')
  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  const age =
    now === undefined ? 'unknown' : snapshotAge(release.observedAt, now)
  const work = release.work.filter(
    (item) => filter === 'all' || item.state === 'blocked',
  )
  return (
    <section
      id="operations"
      aria-labelledby="operations-heading"
      className="min-w-0 scroll-mt-20"
    >
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>
              <h2 id="operations-heading">Operations</h2>
            </CardTitle>
            <Badge variant="outline">
              {release.version} · {release.environment}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-2">
            <h3 className="font-semibold">
              Deployment blocked · new release not verified live
            </h3>
            <p className="text-sm">
              The code is prepared and staged. The deployment tool declined to
              apply it. Railway also reports earlier attempts still
              initializing. These are separate blockers.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Release', 'Prepared locally'],
              ['Provider patch', `${release.patch.changes} changes staged`],
              ['Live monitoring', 'Not connected'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium mt-1">{value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <Badge variant={age === 'recent' ? 'secondary' : 'outline'}>
                {age === 'stale'
                  ? 'Snapshot is stale'
                  : age === 'recent'
                    ? 'Recent snapshot'
                    : 'Snapshot age unknown'}
              </Badge>
            </p>
            <p>
              Observed{' '}
              <time dateTime={release.observedAt}>
                {release.observedAt.replace('T', ' ').replace('.644Z', ' UTC')}
              </time>
              .
            </p>
            <p className="text-muted-foreground">
              Source: {release.source}. This saved observation does not update
              when you reload. No private logs, credentials or member records
              are included.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="text-sm underline underline-offset-4"
              href={railwayUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open Railway to inspect current state
            </a>
            <Button
              variant="outline"
              onClick={() => {
                const url = URL.createObjectURL(
                  new Blob([JSON.stringify(release, null, 2)], {
                    type: 'application/json',
                  }),
                )
                const anchor = document.createElement('a')
                anchor.href = url
                anchor.download = 'ark-release-observation.json'
                anchor.click()
                window.setTimeout(() => URL.revokeObjectURL(url), 1000)
              }}
            >
              Export observation
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">Work ledger</h3>
              <fieldset className="flex gap-2">
                <legend className="sr-only">Filter work ledger</legend>
                <Button
                  variant="outline"
                  aria-pressed={filter === 'all'}
                  onClick={() => setFilter('all')}
                >
                  All work
                </Button>
                <Button
                  variant="outline"
                  aria-pressed={filter === 'blocked'}
                  onClick={() => setFilter('blocked')}
                >
                  Blockers
                </Button>
              </fieldset>
            </div>
            <ol className="space-y-3">
              {work.map((item) => (
                <li key={item.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <Badge
                      variant={
                        item.state === 'blocked' ? 'destructive' : 'outline'
                      }
                    >
                      {stateLabels[item.state as WorkState]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.evidence}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer font-medium">
              Service map and operating limits
            </summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {release.services.map((service) => (
                <div
                  key={service.name}
                  className="min-w-0 rounded-lg bg-muted p-3 space-y-1"
                >
                  <h4 className="font-medium">{service.name}</h4>
                  <code className="text-xs break-all">{service.folder}</code>
                  <p className="text-sm">{service.purpose}</p>
                  <Badge variant="outline">Prepared · live unverified</Badge>
                </div>
              ))}
            </div>
            <p className="text-sm mt-4">
              Budget profile: the default build uses one container. No new paid
              services were created for this dashboard. Current spend is
              unknown; a container limit is not a billing cap.
            </p>
            <p className="text-sm mt-2">
              Compact mode shares one process. SQLite metadata requires one
              writer. Separate containers and database roles are prepared
              options, not active isolation or horizontal scaling.
            </p>
          </details>
          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer font-medium">
              Provider deployment observations
            </summary>
            <ul className="mt-4 space-y-3">
              {release.deployments.map((deployment) => (
                <li key={deployment.label} className="text-sm space-y-1">
                  <p className="font-medium">
                    {deploymentLabel(deployment.status)}
                  </p>
                  <p className="break-all font-mono text-xs">
                    {deployment.label}
                  </p>
                  <p>
                    Started{' '}
                    <time dateTime={deployment.createdAt}>
                      {deployment.createdAt}
                    </time>
                  </p>
                </li>
              ))}
            </ul>
          </details>
          <details className="rounded-lg border p-4" open>
            <summary className="cursor-pointer font-medium">
              How to unblock the release
            </summary>
            <ol className="list-decimal pl-5 mt-3 space-y-2 text-sm">
              <li>
                Open the testing environment in Railway. Inspect the stuck
                ark-core deployment logs before retrying. Cancel obsolete
                attempts only after checking which deployment is serving
                traffic.
              </li>
              <li>
                Review the staged patch: 34 non-destructive changes, ark-core
                only. Apply that reviewed patch once in Railway if the connector
                approval remains blocked.
              </li>
              <li>
                Wait for provider success, then verify the application, sign-in
                and configuration. Success alone does not prove paid onboarding
                works.
              </li>
            </ol>
            <p className="text-sm text-muted-foreground mt-3">
              ChatGPT app permissions and provider authorization are separate
              checks. Review Railway under ChatGPT Settings → Apps or Plugins.
              The returned error does not identify the exact policy or approval
              failure.
            </p>
          </details>
        </CardContent>
      </Card>
    </section>
  )
}
