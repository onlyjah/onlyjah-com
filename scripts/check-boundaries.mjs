import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { sourceFiles } from './source-files.mjs'

// Keep the copyable UI independent of this app, its routes and its providers.
for (const path of await sourceFiles('src/components')) {
  const source = await readFile(path, 'utf8')
  for (const [, dependency] of source.matchAll(
    /(?:from\s+|import\s*)['"]([^'"]+)['"]/g,
  )) {
    assert.ok(
      !/^@(?:clerk|neon|stripe|tanstack)\//.test(dependency),
      `${path}: provider dependency ${dependency}`,
    )
    if (!dependency.startsWith('@/') && !dependency.startsWith('.')) continue
    const target = dependency.startsWith('@/')
      ? resolve('src', dependency.slice(2))
      : resolve(dirname(path), dependency)
    assert.ok(
      target.startsWith(`${resolve('src/components')}/`) ||
        target.startsWith(`${resolve('src/lib')}/`),
      `${path}: app dependency ${dependency}`,
    )
  }
}
for (const path of await sourceFiles('src')) {
  if (extname(path) === '.css') continue
  const source = await readFile(path, 'utf8')
  assert.ok(
    !/\b(?:createServerFn|createServerFileRoute|createAPIFileRoute)\s*\(/.test(
      source,
    ),
    `${path}: static clients cannot call an app server`,
  )
  assert.ok(
    !/from\s+['"]@tanstack\/[^'"]*\/server['"]/.test(source),
    `${path}: server-only import`,
  )
  assert.ok(
    !/\bserver\s*:\s*\{\s*handlers\s*:/.test(source),
    `${path}: HTTP application handlers`,
  )
}
console.log('PASS: reusable UI boundaries and static client source.')
