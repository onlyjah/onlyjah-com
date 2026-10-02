import assert from 'node:assert/strict'
import { test } from 'node:test'
import { displayText, remarkDisplayText } from '../src/lib/display-text.ts'

test('authorized display cleanup keeps the input archive intact', () => {
  const original = 'One\u2014two --- flow through. Flow through.'
  assert.equal(displayText(original), 'One-two - flowthrough. Flowthrough.')
  assert.equal(original, 'One\u2014two --- flow through. Flow through.')
})

test('Markdown cleanup preserves rules, code and link destinations', () => {
  const tree = {
    type: 'root',
    children: [
      { type: 'text', value: 'unity --- love' },
      { type: 'thematicBreak' },
      { type: 'code', value: 'git --- flow through' },
      { type: 'inlineCode', value: '---' },
      {
        type: 'link',
        url: 'https://example.test/a---b',
        children: [{ type: 'text', value: 'A --- B' }],
      },
    ],
  }
  remarkDisplayText()(tree)
  assert.equal(tree.children[0].value, 'unity - love')
  assert.equal(tree.children[1].type, 'thematicBreak')
  assert.equal(tree.children[2].value, 'git --- flow through')
  assert.equal(tree.children[3].value, '---')
  assert.equal(tree.children[4].url, 'https://example.test/a---b')
  assert.equal(tree.children[4].children[0].value, 'A - B')
})
