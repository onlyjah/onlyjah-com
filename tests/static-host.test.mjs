import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createStaticServer } from '../scripts/serve-static.mjs'

test('portable static host preserves 404s, health, HEAD, and method boundaries', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'oj-static-'))
  await writeFile(join(dir, 'index.html'), '<h1>Home</h1>')
  await writeFile(join(dir, '404.html'), '<h1>404</h1>')
  const server = createStaticServer(dir)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`
  try {
    assert.equal((await fetch(origin + '/healthz')).status, 200)
    const home = await fetch(origin + '/')
    assert.equal(home.status, 200)
    assert.match(await home.text(), /Home/)
    const missing = await fetch(origin + '/missing')
    assert.equal(missing.status, 404)
    assert.match(await missing.text(), /404/)
    assert.equal(
      await (await fetch(origin + '/', { method: 'HEAD' })).text(),
      '',
    )
    assert.equal((await fetch(origin + '/', { method: 'POST' })).status, 405)
    assert.equal((await fetch(origin + '/%00')).status, 400)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    await rm(dir, { recursive: true, force: true })
  }
})
