import type { CSSProperties } from 'react'

type Tokens = CSSProperties & Record<`--${string}`, string>

// Review-only token overrides. Nothing here changes the site's approved palette.
// An accepted palette can later replace theme.css using a tweakcn export.
export const paletteProposal: Record<'light' | 'dark', Tokens> = {
  light: {
    '--background': 'oklch(0.985 0.008 85)',
    '--foreground': 'oklch(0.22 0.016 150)',
    '--card': 'oklch(1 0 0)',
    '--card-foreground': 'oklch(0.22 0.016 150)',
    '--primary': 'oklch(0.5 0.1 85)',
    '--primary-foreground': 'oklch(0.985 0.008 85)',
    '--secondary': 'oklch(0.95 0.012 85)',
    '--secondary-foreground': 'oklch(0.22 0.016 150)',
    '--muted': 'oklch(0.95 0.012 85)',
    '--muted-foreground': 'oklch(0.46 0.025 150)',
    '--accent': 'oklch(0.92 0.035 150)',
    '--accent-foreground': 'oklch(0.26 0.05 150)',
    '--border': 'oklch(0.87 0.02 85)',
    '--ring': 'oklch(0.52 0.1 150)',
  },
  dark: {
    '--background': 'oklch(0.2 0.014 150)',
    '--foreground': 'oklch(0.97 0.012 85)',
    '--card': 'oklch(0.25 0.018 150)',
    '--card-foreground': 'oklch(0.97 0.012 85)',
    '--primary': 'oklch(0.86 0.15 85)',
    '--primary-foreground': 'oklch(0.2 0.014 150)',
    '--secondary': 'oklch(0.3 0.022 150)',
    '--secondary-foreground': 'oklch(0.97 0.012 85)',
    '--muted': 'oklch(0.3 0.022 150)',
    '--muted-foreground': 'oklch(0.77 0.018 85)',
    '--accent': 'oklch(0.36 0.065 150)',
    '--accent-foreground': 'oklch(0.97 0.012 85)',
    '--border': 'oklch(0.42 0.025 150)',
    '--ring': 'oklch(0.86 0.15 85)',
  },
}
