import draft from '../../docs/drafts/ark-notes-001.md?raw'
import overview from '../../docs/manual/00-overview.md?raw'
import vision from '../../docs/manual/10-vision.md?raw'
import ecosystem from '../../docs/manual/20-ecosystem.md?raw'
import ark from '../../docs/manual/30-ark.md?raw'
import design from '../../docs/manual/40-design.md?raw'
import access from '../../docs/manual/50-access.md?raw'
import architecture from '../../docs/manual/60-architecture.md?raw'
import launch from '../../docs/manual/70-launch.md?raw'

function chapter(
  slug: string,
  label: string,
  tags: string[],
  status: string,
  markdown: string,
) {
  return {
    slug,
    label,
    tags,
    status,
    updated: '2026-10-02',
    title: markdown.match(/^# (.+)/)?.[1] ?? label,
    body: markdown.replace(/^# .+\r?\n/, '').trim(),
  }
}

export const chapters = [
  chapter(
    'overview',
    'Overview',
    ['OnlyJah', 'Ark'],
    'Source quotations',
    overview,
  ),
  chapter(
    'vision',
    'Vision and principles',
    ['vision', 'collaboration'],
    'Source quotations',
    vision,
  ),
  chapter(
    'ecosystem',
    'The ecosystem',
    ['Forge', 'Media', 'Realm'],
    'Source quotations',
    ecosystem,
  ),
  chapter(
    'ark',
    'Ark and interoperability',
    ['Ark', 'interoperability'],
    'Source quotations',
    ark,
  ),
  chapter(
    'design',
    'Creative system',
    ['design', 'editorial'],
    'Source quotations',
    design,
  ),
  chapter(
    'access',
    'Access and sustainability',
    ['access', 'sustainability'],
    'Source quotations',
    access,
  ),
  chapter(
    'architecture',
    'Architecture',
    ['architecture', 'static', 'auth'],
    'Source quotations',
    architecture,
  ),
  chapter(
    'launch',
    'Launch and roadmap',
    ['waypoints', 'review'],
    'Source quotations',
    launch,
  ),
]

export const arkNotes = {
  title: draft.match(/^# (.+)/)?.[1] ?? 'Ark Notes 001',
  body: draft.replace(/^# .+\r?\n/, '').trim(),
}
