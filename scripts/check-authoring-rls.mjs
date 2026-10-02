import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

// An isolated local cluster only: never read DATABASE_URL or connect to Neon.
const bin = process.env.OJ_TEST_PG_BIN ?? '/usr/lib/postgresql/17/bin'
const work = mkdtempSync(join(tmpdir(), 'onlyjah-authoring-pg-'))
const data = join(work, 'data')
const socket = join(work, 'socket')
mkdirSync(socket)
function run(name, args) {
  const result = spawnSync(join(bin, name), args, { encoding: 'utf8' })
  if (result.error) throw result.error
  if (result.status !== 0)
    throw new Error(`${name} failed: ${result.stderr || result.stdout}`)
  return result.stdout
}
let started = false
try {
  run('initdb', [
    '-D',
    data,
    '-U',
    'onlyjah_test_admin',
    '--auth-local=trust',
    '--auth-host=reject',
  ])
  run('pg_ctl', [
    '-D',
    data,
    '-l',
    join(work, 'postgres.log'),
    '-o',
    `-k ${socket} -h '' -p 55471`,
    '-w',
    'start',
  ])
  started = true
  const connection = [
    '-h',
    socket,
    '-p',
    '55471',
    '-U',
    'onlyjah_test_admin',
    '-v',
    'ON_ERROR_STOP=1',
  ]
  run('psql', [
    ...connection,
    '-d',
    'postgres',
    '-c',
    'CREATE DATABASE onlyjah_test_authoring;',
  ])
  const database = [...connection, '-d', 'onlyjah_test_authoring']
  // This fixture replaces no real provider identity function.
  run('psql', [
    ...database,
    '-c',
    `
    CREATE ROLE anonymous NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE onlyjah_test_provider NOLOGIN;
    CREATE ROLE onlyjah_test_migrator NOLOGIN;
    CREATE SCHEMA auth AUTHORIZATION onlyjah_test_provider;
    CREATE FUNCTION auth.user_id() RETURNS text LANGUAGE sql STABLE AS $$
      SELECT nullif(current_setting('request.jwt.claim.sub',true),'')
    $$;
    ALTER FUNCTION auth.user_id() OWNER TO onlyjah_test_provider;
    -- Match the observed Neon starting state: auth has no schema USAGE grants.
    GRANT USAGE ON SCHEMA public TO authenticated,anonymous;
    GRANT USAGE,CREATE ON SCHEMA public TO onlyjah_test_migrator;
    GRANT USAGE ON SCHEMA auth TO onlyjah_test_migrator;
    GRANT EXECUTE ON FUNCTION auth.user_id() TO authenticated,anonymous;
  `,
  ])
  for (const file of [
    'docs/backend/migrations/001-member-profiles.sql',
    'docs/backend/migrations/002-authoring-community.sql',
    'docs/backend/migrations/003-public-author-name.sql',
    'docs/backend/migrations/004-auth-schema-usage.sql',
    'tests/auth-schema-regression.sql',
    'docs/backend/migrations/005-managed-identity.sql',
    'tests/authoring-rls.sql',
    'docs/backend/migrations/006-contributors-and-forge-items.sql',
    'tests/contributors-rls.sql',
  ]) {
    run('psql', [
      ...database,
      ...(file.startsWith('docs/backend/migrations/')
        ? ['-c', 'SET ROLE onlyjah_test_migrator']
        : []),
      '-f',
      resolve(file),
    ])
    console.log(`PASS ${file}`)
  }
} finally {
  if (started) run('pg_ctl', ['-D', data, '-m', 'fast', '-w', 'stop'])
  console.log(`Scratch PostgreSQL files preserved: ${work}`)
}
