import type { DesignPreset } from '@/lib/design'
import professional from './tokens/jahnoah-com.tokens.json' with {
  type: 'json',
}
import creative from './tokens/jahnoah-lol.tokens.json' with { type: 'json' }
import platform from './tokens/onlyjah.tokens.json' with { type: 'json' }

function palette({
  background,
  foreground,
  surface,
  muted,
  mutedForeground,
  primary,
  primaryForeground,
  accent,
  accentForeground,
  border,
  display,
  body,
  radius,
}: {
  background: string
  foreground: string
  surface: string
  muted: string
  mutedForeground: string
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  border: string
  display: string
  body: string
  radius: string
}) {
  return {
    '--background': background,
    '--foreground': foreground,
    '--card': surface,
    '--card-foreground': foreground,
    '--popover': surface,
    '--popover-foreground': foreground,
    '--muted': muted,
    '--muted-foreground': mutedForeground,
    '--secondary': muted,
    '--secondary-foreground': foreground,
    '--primary': primary,
    '--primary-foreground': primaryForeground,
    '--accent': accent,
    '--accent-foreground': accentForeground,
    '--border': border,
    '--input': border,
    '--ring': primary,
    '--font-display': display,
    '--font-sans': body,
    '--radius': radius,
  }
}
const p = platform.color,
  c = professional.color,
  a = creative.color
export const designStorageKey = 'onlyjah-design'
// User token values are the source. Contrast adaptations are engineering choices.
// The original roots theme remains the default and can be restored in one click.
export const designPresets: readonly DesignPreset[] = [
  { id: 'roots', label: 'Roots', light: {}, dark: {} },
  {
    id: 'onlyjah',
    label: 'OnlyJah',
    light: palette({
      background: p.paper.value,
      foreground: p.ink.value,
      surface: '#ffffff',
      muted: p.muted.value,
      mutedForeground: p['muted-foreground'].value,
      primary: p.ink.value,
      primaryForeground: p.paper.value,
      accent: p.citrus.value,
      accentForeground: p.ink.value,
      border: '#c5c0b5',
      display: platform.font.display.value,
      body: platform.font.body.value,
      radius: platform.radius.value,
    }),
    dark: palette({
      background: p.ink.value,
      foreground: p.paper.value,
      surface: '#211e18',
      muted: '#302b23',
      mutedForeground: '#c5c0b5',
      primary: p.citrus.value,
      primaryForeground: p.ink.value,
      accent: '#302b23',
      accentForeground: p.paper.value,
      border: '#625b4e',
      display: platform.font.display.value,
      body: platform.font.body.value,
      radius: platform.radius.value,
    }),
  },
  {
    id: 'jahnoah-com',
    label: 'JahNoah.com',
    light: palette({
      background: c.paper.value,
      foreground: c.ink.value,
      surface: '#ffffff',
      muted: c.muted.value,
      mutedForeground: '#686252',
      primary: c.accent.value,
      primaryForeground: c.paper.value,
      accent: c.muted.value,
      accentForeground: c.ink.value,
      border: c.border.value,
      display: professional.font.display.value,
      body: professional.font.body.value,
      radius: professional.radius.value,
    }),
    dark: palette({
      background: c.ink.value,
      foreground: c.paper.value,
      surface: '#27241e',
      muted: '#353027',
      mutedForeground: '#cec3ad',
      primary: '#e8a591',
      primaryForeground: c.ink.value,
      accent: '#353027',
      accentForeground: c.paper.value,
      border: '#645b49',
      display: professional.font.display.value,
      body: professional.font.body.value,
      radius: professional.radius.value,
    }),
  },
  {
    id: 'jahnoah-lol',
    label: 'JahNoah.lol',
    light: palette({
      background: '#faf4ef',
      foreground: a.paper.value,
      surface: '#ffffff',
      muted: '#eadedb',
      mutedForeground: '#6e5159',
      primary: '#903d29',
      primaryForeground: '#ffffff',
      accent: '#eadedb',
      accentForeground: a.paper.value,
      border: '#c8b4b5',
      display: creative.font.display.value,
      body: creative.font.body.value,
      radius: creative.radius.value,
    }),
    dark: palette({
      background: a.paper.value,
      foreground: a.ink.value,
      surface: a.muted.value,
      muted: a.plum.value,
      mutedForeground: '#b3a29e',
      primary: '#ed9b83',
      primaryForeground: a.paper.value,
      accent: a.plum.value,
      accentForeground: a.ink.value,
      border: a.border.value,
      display: creative.font.display.value,
      body: creative.font.body.value,
      radius: creative.radius.value,
    }),
  },
]
