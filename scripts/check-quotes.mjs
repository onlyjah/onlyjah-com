// Verify against the private source master when present, otherwise the checked public subset.
process.env.COPY_STAGE = 'testing'
process.argv.push('--check')
await import('./compile-copy.mjs')
