import { readFileSync } from 'node:fs'
/** Local static-artifact preview. Deploy only .output/public; this is not an application backend. */

import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import {
  createStagingAccess,
  hostedTestingAccessRequired,
} from './staging-access.mjs'

const redirects = JSON.parse(
  readFileSync(
    new URL('../content/legacy-redirects.json', import.meta.url),
    'utf8',
  ),
)

const root = resolve(process.env.STATIC_ROOT || '.output/public')
const port = Number(process.env.PORT || 8080)
const accessRequired = hostedTestingAccessRequired(process.env)
const authorize = createStagingAccess({
  required: accessRequired,
  teamDomain: process.env.CF_ACCESS_TEAM_DOMAIN,
  audience: process.env.CF_ACCESS_AUD,
  allowedEmails: process.env.STAGING_ALLOWED_EMAILS,
})
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end()
    return
  }
  let pathname
  try {
    pathname = decodeURIComponent(
      new URL(req.url || '/', 'http://localhost').pathname,
    )
  } catch {
    res.writeHead(400).end()
    return
  }
  if (pathname.includes('\0') || pathname.includes('\\')) {
    res.writeHead(400).end()
    return
  }
  // Railway can check process health without retrieving any staging bytes.
  if (pathname === '/healthz') {
    res.writeHead(204, { 'cache-control': 'no-store' }).end()
    return
  }
  if (accessRequired) {
    res.setHeader('cache-control', 'private, no-store')
    res.setHeader('x-robots-tag', 'noindex, nofollow')
    const status = await authorize(req.headers)
    if (status !== 200) {
      res
        .writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
        .end(
          req.method === 'HEAD' ? undefined : 'Staging access is restricted.',
        )
      return
    }
  }
  const legacy = redirects[pathname.replace(/\/$/, '')]
  if (legacy) {
    res
      .writeHead(308, {
        location: legacy + new URL(req.url, 'http://localhost').search,
      })
      .end()
    return
  }
  const raw = pathname.endsWith('/') ? `${pathname}index.html` : pathname
  const candidates = extname(raw) ? [raw] : [`${raw}.html`, `${raw}/index.html`]
  for (const path of candidates) {
    const filename = resolve(root, `.${path}`)
    if (filename !== root && !filename.startsWith(`${root}${sep}`)) continue
    try {
      const info = await stat(filename)
      if (!info.isFile()) continue
      const type = contentTypes[extname(filename)] || 'application/octet-stream'
      res.writeHead(200, {
        'content-type': type,
        'cache-control': accessRequired
          ? 'private, no-store'
          : extname(filename) === '.html'
            ? 'public, max-age=60'
            : 'public, max-age=3600',
        'x-content-type-options': 'nosniff',
      })
      if (req.method === 'HEAD') {
        res.end()
        return
      }
      createReadStream(filename).pipe(res)
      return
    } catch {
      /* try next candidate */
    }
  }
  res
    .writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    .end('This page has not been published.')
}).listen(port, process.env.HOST || '127.0.0.1', () =>
  console.log(`OnlyJah static site serving ${root} on :${port}`),
)
