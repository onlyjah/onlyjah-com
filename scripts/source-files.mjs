import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export async function sourceFiles(directory) {
  const paths = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) paths.push(...(await sourceFiles(path)))
    else if (/\.(tsx?|css)$/.test(entry.name)) paths.push(path)
  }
  return paths.sort()
}
