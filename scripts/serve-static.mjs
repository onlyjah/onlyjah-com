import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
}
export function createStaticServer(directory) {
  const root = resolve(directory)
  return createServer(async (req, res) => {
    const head = req.method === 'HEAD'
    const send = (code, body, type = 'text/plain; charset=utf-8') => {
      res.writeHead(code, {
        'Content-Type': type,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
      })
      res.end(head ? undefined : body)
    }
    if (!['GET', 'HEAD'].includes(req.method || '')) {
      res.setHeader('Allow', 'GET, HEAD')
      return send(405, 'Method not allowed')
    }
    let path
    try {
      path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    } catch {
      return send(400, 'Bad request')
    }
    if (path.includes('\0') || path.includes('\\'))
      return send(400, 'Bad request')
    if (path === '/healthz') {
      try {
        await stat(resolve(root, 'index.html'))
        return send(200, '{"status":"ok"}', 'application/json')
      } catch {
        return send(503, '{"status":"unavailable"}', 'application/json')
      }
    }
    const file = resolve(root, '.' + path)
    if (file !== root && !file.startsWith(root + sep))
      return send(403, 'Forbidden')
    try {
      let target = file
      const info = await stat(target)
      if (info.isDirectory()) target = resolve(target, 'index.html')
      return send(
        200,
        await readFile(target),
        mime[extname(target)] || 'application/octet-stream',
      )
    } catch {
      try {
        return send(
          404,
          await readFile(resolve(root, '404.html')),
          'text/html; charset=utf-8',
        )
      } catch {
        return send(404, 'Not found')
      }
    }
  })
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const port = Number(process.env.PORT || 4173)
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw new Error('Invalid PORT')
  const server = createStaticServer(process.env.PUBLIC_DIR || '.output/public')
  server.listen(port, process.env.HOST || '127.0.0.1', () =>
    console.log(
      `Static client listening on ${JSON.stringify(server.address())}`,
    ),
  )
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () => server.close(() => process.exit(0)))
}
