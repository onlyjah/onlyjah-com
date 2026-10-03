import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { sourceFiles } from './source-files.mjs'

// Export from an allowlist, never by copying the repository wholesale.
const repo = resolve('.')
const revision = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
  encoding: 'utf8',
}).trim()
const dirty = Boolean(
  execFileSync(
    'git',
    [
      'status',
      '--porcelain',
      '--',
      'src/components',
      'src/lib',
      'src/styles.css',
      'src/theme.css',
      'src/features/design',
    ],
    { encoding: 'utf8' },
  ).trim(),
)
const destination = resolve('exports', `onlyjah-ui-${revision}-${Date.now()}`)
const source = JSON.parse(await readFile('package.json', 'utf8'))
const files = {}
async function emit(path, text) {
  const target = resolve(destination, path)
  assert.ok(
    target.startsWith(`${destination}${sep}`),
    'Export path escapes destination',
  )
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, text)
  files[path] = createHash('sha256').update(text).digest('hex')
}
const paths = [
  ...(await sourceFiles('src/components')),
  ...(await sourceFiles('src/lib')),
  'src/styles.css',
  'src/theme.css',
]
for (const path of paths) {
  const text = (await readFile(path, 'utf8')).replace(
    /(['"])@\/([^'"]+)\1/g,
    (_, quote, target) => {
      const link = relative(
        dirname(resolve(path)),
        resolve(repo, 'src', target),
      )
        .split(sep)
        .join('/')
      return `${quote}${link.startsWith('.') ? link : `./${link}`}${quote}`
    },
  )
  assert.ok(
    !text.includes('import.meta.env'),
    `${path}: environment-coupled UI`,
  )
  await emit(path, text)
}
// Optional user-supplied branding stays separate from the generic provider.
await emit(
  'src/design-presets.ts',
  (await readFile('src/features/design/presets.ts', 'utf8')).replace(
    "'@/lib/design'",
    "'./lib/design'",
  ),
)
for (const name of ['onlyjah', 'jahnoah-com', 'jahnoah-lol']) {
  await emit(
    `src/tokens/${name}.tokens.json`,
    await readFile(`src/features/design/tokens/${name}.tokens.json`, 'utf8'),
  )
}
await emit(
  'token-provenance.json',
  await readFile('docs/design/token-provenance.json', 'utf8'),
)
const dependencyNames = [
  '@base-ui/react',
  'class-variance-authority',
  'cn',
  'lucide-react',
  'react-markdown',
  'remark-gfm',
]
const dependencies = Object.fromEntries(
  dependencyNames.map((name) => [name, source.dependencies[name]]),
)
await emit(
  'package.json',
  `${JSON.stringify(
    {
      name: '@onlyjah/ui',
      version: '0.0.0',
      private: true,
      type: 'module',
      exports: {
        './ui/*': './src/components/ui/*.tsx',
        './blocks/*': './src/components/blocks/*.tsx',
        './sections/*': './src/components/sections/*.tsx',
        './layouts/*': './src/components/layouts/*.tsx',
        './providers/*': './src/components/providers/*.tsx',
        './lib/*': './src/lib/*.ts',
        './styles.css': './src/styles.css',
        './theme.css': './src/theme.css',
        './design-presets': './src/design-presets.ts',
      },
      dependencies,
      peerDependencies: {
        react: '^19.3.0',
        'react-dom': '^19.3.0',
        tailwindcss: '^4.3.3',
        'tw-animate-css': '^1.4.0',
        shadcn: '^4.21.1',
      },
    },
    null,
    2,
  )}\n`,
)
await emit(
  'tsconfig.json',
  `${JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
      },
      include: ['src'],
    },
    null,
    2,
  )}\n`,
)
await emit(
  'licenses/LUCIDE-LICENSE.txt',
  await readFile('docs/design/LUCIDE-LICENSE.txt', 'utf8'),
)
await emit('README.md', await readFile('docs/templates/UI-PACKAGE.md', 'utf8'))
await emit(
  'export-manifest.json',
  `${JSON.stringify(
    {
      format: 'onlyjah-ui-source',
      version: 1,
      revision,
      dirty,
      files,
    },
    null,
    2,
  )}\n`,
)
console.log(
  `Exported ${Object.keys(files).length} verified UI source files to ${destination}`,
)
