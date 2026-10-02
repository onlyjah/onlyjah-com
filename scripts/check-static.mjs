import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { htmlText } from './html-text.mjs'
import { routes } from './routes.mjs'

export const output = resolve('.output/public')
export function pageFile(path) {
  return resolve(output, `.${path}`, 'index.html')
}
const known = new Set(Object.keys(routes))
let assetCount = 0
for (const [path, expected] of Object.entries(routes)) {
  const html = await readFile(pageFile(path), 'utf8')
  const heading = html
    .match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1]
    .replace(/<[^>]*>/g, '')
  assert.equal(
    heading ? htmlText(heading) : heading,
    expected,
    `${path}: meaningful prerendered heading`,
  )
  assert.match(
    html,
    /<main[^>]*id="main-content"/,
    `${path}: skip-link destination`,
  )
  assert.match(html, /<html lang="en"/, `${path}: language`)
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1]
    if (!url.startsWith('/') || url.startsWith('//')) continue
    const pathname = url.split(/[?#]/)[0].replace(/\/$/, '') || '/'
    if (pathname.startsWith('/assets/') || pathname.startsWith('/images/')) {
      assert.ok(
        (await stat(resolve(output, `.${pathname}`))).isFile(),
        `asset ${url}`,
      )
      assetCount++
    } else
      assert.ok(
        known.has(pathname) || pathname === '/favicon.ico',
        `${path}: unresolved link ${url}`,
      )
  }
  if (path === '/docs') {
    assert.match(html, /data-slot="card"/, 'actual shadcn Cards rendered')
    assert.match(
      html,
      /data-slot="button"/,
      'actual shadcn tag filter buttons rendered',
    )
    assert.match(
      html,
      /data-slot="badge"/,
      'actual shadcn metadata badges rendered',
    )
  }
  assert.ok(
    ![...html.matchAll(/class="([^"]*)"/g)].some((match) =>
      match[1].split(/\s+/).some((name) => name.startsWith('oj-')),
    ),
    `${path}: legacy CSS classes removed`,
  )
  if (
    [
      '/sign-up',
      '/sign-in',
      '/account',
      '/design-preview',
      '/realm/community',
    ].includes(path)
  ) {
    assert.match(html, /noindex, nofollow/)
    assert.ok(
      !html.includes('member_profiles'),
      `${path}: no private data in static HTML`,
    )
  }
  if (path.endsWith('ark-notes-001')) {
    assert.match(html, /noindex, nofollow/)
    assert.match(html, /Draft for review/)
  }
  console.log('PASS', path)
}
console.log(
  `PASS: ${known.size} meaningful pages; ${assetCount} asset references; all internal destinations; draft metadata`,
)
