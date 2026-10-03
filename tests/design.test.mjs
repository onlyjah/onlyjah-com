import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { designPresets } from '../src/features/design/presets.ts'
import { designInitScript } from '../src/lib/design.ts'

test('supplied token files retain their recorded original bytes', async () => {
  const sources = JSON.parse(
    await readFile(
      new URL('../docs/design/token-provenance.json', import.meta.url),
      'utf8',
    ),
  )
  for (const source of sources) {
    const data = await readFile(
      new URL(`../src/features/design/tokens/${source.file}`, import.meta.url),
    )
    assert.equal(createHash('sha256').update(data).digest('hex'), source.sha256)
  }
})

const presets = [
  { id: 'roots', label: 'Roots', light: {}, dark: {} },
  {
    id: 'custom',
    label: 'Custom',
    light: { '--background': '#fff' },
    dark: { '--background': '#111' },
  },
]
function initialize({ saved = null, dark = false, blocked = false } = {}) {
  const properties = new Map()
  const root = {
    classList: { contains: () => dark },
    style: { setProperty: (key, value) => properties.set(key, value) },
    dataset: {},
  }
  runInNewContext(designInitScript(presets, 'design'), {
    document: { documentElement: root },
    localStorage: {
      getItem: () => {
        if (blocked) throw new Error('Storage unavailable')
        return saved
      },
    },
  })
  return { root, properties }
}
test('saved design uses the resolved theme before the first paint', () => {
  assert.equal(
    initialize({ saved: 'custom' }).properties.get('--background'),
    '#fff',
  )
  assert.equal(
    initialize({ saved: 'custom', dark: true }).properties.get('--background'),
    '#111',
  )
})
test('unknown design and unavailable storage safely preserve the default', () => {
  for (const settings of [{ saved: 'unknown' }, { blocked: true }, {}]) {
    const { root, properties } = initialize(settings)
    assert.equal(root.dataset.design, 'roots')
    assert.equal(properties.size, 0)
  }
})
test('fixed token data cannot terminate the HTML script element', () => {
  const script = designInitScript(
    [{ ...presets[0], label: '</script><script>alert(1)</script>' }],
    'design',
  )
  assert.ok(!script.includes('</script>'))
})

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((value) => parseInt(value, 16) / 255)
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  )
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}
test('design text and control labels meet normal-text contrast in both modes', () => {
  for (const preset of designPresets.filter((value) => value.id !== 'roots')) {
    for (const mode of ['light', 'dark']) {
      const tokens = preset[mode]
      for (const [background, foreground] of [
        ['--background', '--foreground'],
        ['--card', '--card-foreground'],
        ['--primary', '--primary-foreground'],
        ['--accent', '--accent-foreground'],
        ['--muted', '--muted-foreground'],
        ['--background', '--muted-foreground'],
      ]) {
        const values = [
          luminance(tokens[background]),
          luminance(tokens[foreground]),
        ].sort((a, b) => a - b)
        const ratio = (values[1] + 0.05) / (values[0] + 0.05)
        assert.ok(
          ratio >= 4.5,
          `${preset.id} ${mode} ${foreground}/${background}: ${ratio.toFixed(2)}`,
        )
      }
    }
  }
})
