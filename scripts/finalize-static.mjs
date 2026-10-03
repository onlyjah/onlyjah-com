import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

const root = resolve('.output/public')
const redirects = JSON.parse(
  await readFile('content/legacy-redirects.json', 'utf8'),
)
// Static hosts cannot execute the local server's 308 logic. Emit portable fallbacks.
for (const [from, to] of Object.entries(redirects)) {
  if (!/^\/[a-z0-9/-]+$/.test(from) || !/^\/[a-z0-9/-]+$/.test(to))
    throw new Error('Legacy redirect paths must be fixed, safe local paths')
  const directory = join(root, from.slice(1))
  await mkdir(directory, { recursive: true })
  await writeFile(
    join(directory, 'index.html'),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${to}"><title>Redirecting</title><script>location.replace(${JSON.stringify(to)} + location.search + location.hash)</script></head><body><a href="${to}">Continue</a></body></html>\n`,
  )
}
const files = {}
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await inspect(path)
    else if (entry.isFile()) {
      const name = relative(root, path)
      if (name === 'static-release.json') continue
      if (/\.(?:mjs|sql|map)$/.test(name) || /(?:^|\/)\.env/.test(name))
        throw new Error(`Unexpected private/server artifact: ${name}`)
      files[name] = createHash('sha256')
        .update(await readFile(path))
        .digest('hex')
    } else throw new Error(`Non-file static artifact: ${path}`)
  }
}
await inspect(root)
if (!files['index.html']) throw new Error('Static homepage was not generated')
// SSR exists only during the build. No application server is shipped.
await rm(resolve('.output/build-server'), { recursive: true, force: true })
await rm(resolve('.output/server'), { recursive: true, force: true })
await writeFile(
  join(root, 'static-release.json'),
  `${JSON.stringify(
    {
      format: 'onlyjah-static-release',
      version: 1,
      stage: process.env.VITE_RELEASE_STAGE || 'publication',
      files,
    },
    null,
    2,
  )}\n`,
)
console.log(
  `Finalized ${Object.keys(files).length} static files; removed build-time server output.`,
)
