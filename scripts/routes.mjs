import { readFileSync } from 'node:fs'

const terms = JSON.parse(
  readFileSync(new URL('../src/content/terms.json', import.meta.url), 'utf8'),
)

export const routes = {
  '/': 'A cloud-faring vessel. Universe in the sky. OnlyJah.',
  '/about': 'OnlyJah',
  '/docs': 'The living manual',
  '/docs/terms': 'Vocabulary',
  ...Object.fromEntries(
    terms.map((term) => [`/docs/terms/${term.id}`, term.label]),
  ),
  '/docs/words': 'OnlyJah dictionary',
  '/docs/overview': 'OnlyJah',
  '/docs/vision': 'Vision',
  '/docs/ecosystem': 'Forge / Media / Realm',
  '/docs/ark': 'Ark',
  '/docs/design': 'Design',
  '/docs/access': 'Access',
  '/docs/architecture': 'Architecture',
  '/docs/launch': 'Waypoint Dynamics Philosophy',
  '/forge': 'Forge',
  '/media': 'Media',
  '/media/docs': 'Documentation',
  '/media/music': 'Music',
  '/media/art': 'Resident art',
  '/media/post': 'Publication',
  '/artist': 'Resident artist',
  '/market': 'Market',
  '/realm/community': 'Community',
  '/docs/authoring': 'Authoring',
  '/media/videos': 'Videos',
  '/media/news': 'News',
  '/realm': 'Realm',
  '/p/ark': 'Ark',
  '/pre-alpha': 'Pre-alpha',
  '/sign-up': 'Join OnlyJah',
  '/sign-in': 'Welcome back',
  '/account': 'Account',
  '/design-preview': 'Design comparison',
  '/media/news/ark-notes-001': 'Ark Notes 001',
}
