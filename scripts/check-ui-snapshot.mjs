import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'

const manifest = JSON.parse(await readFile('vendor/oj-ui.lock.json', 'utf8'))
assert.equal(manifest.repository, 'onlyjah/oj-ui')
const found = []
async function walk(dir, prefix = '') {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const name = prefix + e.name
    if (e.isDirectory()) await walk(`${dir}/${e.name}`, name + '/')
    else {
      found.push(name)
      assert.equal(
        createHash('sha256')
          .update(await readFile(`${dir}/${e.name}`))
          .digest('hex'),
        manifest.files[name],
        `UI snapshot drift: ${name}`,
      )
    }
  }
}
await walk('vendor/oj-ui')
assert.deepEqual(
  found.sort(),
  Object.keys(manifest.files).sort(),
  'Unexpected/missing UI snapshot files',
)
console.log(
  `Verified OJ UI ${manifest.version}: ${found.length} files, source ${manifest.revision}`,
)
