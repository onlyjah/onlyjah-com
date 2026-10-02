import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { readFileSync } from 'node:fs'
import { htmlText } from './html-text.mjs'
import { routes } from './routes.mjs'

const port = '4187'
const child = spawn(process.execPath, ['scripts/preview-static.mjs'], {
  env: { ...process.env, PORT: port, HOST: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
try {
  const ready = once(child.stdout, 'data')
  const failure = once(child, 'exit').then(([code]) => {
    throw new Error(`Static server exited ${code}`)
  })
  await Promise.race([
    ready,
    failure,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Static server did not start')), 5000),
    ),
  ])
  const base = `http://127.0.0.1:${port}`
  const assets = new Set()
  for (const [path, heading] of Object.entries(routes)) {
    for (const url of path === '/' ? [path] : [path, `${path}/`]) {
      const response = await fetch(base + url)
      assert.equal(response.status, 200, url)
      const html = await response.text()
      assert.ok(htmlText(html).includes(heading), url)
      for (const match of html.matchAll(
        /(?:href|src)="(\/(?:assets|images)\/[^"?#]+)[^"]*"/g,
      ))
        assets.add(match[1])
    }
  }
  for (const asset of assets)
    assert.equal((await fetch(base + asset)).status, 200, asset)
  for (const path of [
    '/missing-page',
    '/docs/missing',
    '/.env',
    '/src/router.tsx',
  ])
    assert.equal((await fetch(base + path)).status, 404, path)
  const redirects = JSON.parse(
    readFileSync('content/legacy-redirects.json', 'utf8'),
  )
  for (const [from, to] of Object.entries(redirects)) {
    const response = await fetch(`${base}${from}?from=legacy`, {
      redirect: 'manual',
    })
    assert.equal(response.status, 308, from)
    assert.equal(response.headers.get('location'), `${to}?from=legacy`, from)
    assert.equal((await fetch(base + to)).status, 200, to)
  }
  const head = await fetch(`${base}/docs/vision`, { method: 'HEAD' })
  assert.equal(head.status, 200)
  assert.equal(await head.text(), '')
  assert.equal((await fetch(`${base}/docs`, { method: 'POST' })).status, 405)
  console.log(
    `PASS: ${Object.keys(routes).length} direct routes and slash variants; ${assets.size} assets; ${Object.keys(redirects).length} legacy redirects; 404s; HEAD; method handling. Static bytes only.`,
  )
} finally {
  child.kill()
}
