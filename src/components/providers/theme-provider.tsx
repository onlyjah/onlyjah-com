import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { isTheme, type Theme } from '@/lib/theme'

type ThemeState = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  ready: boolean
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeState | null>(null)

// Keep browser preferences outside page composition and shadcn primitives.
export function ThemeProvider({
  children,
  storageKey = 'ui-theme',
}: {
  children: ReactNode
  storageKey?: string
}) {
  const [theme, updateTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (isTheme(saved)) updateTheme(saved)
    } catch {
      // Storage can be blocked; the toggle still works for this visit.
    }
    setReady(true)
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey)
        updateTheme(isTheme(event.newValue) ? event.newValue : 'system')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [storageKey])

  useEffect(() => {
    if (!ready) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
      setResolvedTheme(dark ? 'dark' : 'light')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [ready, theme])

  function setTheme(value: Theme) {
    updateTheme(value)
    try {
      localStorage.setItem(storageKey, value)
    } catch {
      // A persistent preference is optional; never block interaction on it.
    }
  }

  return (
    <ThemeContext value={{ theme, resolvedTheme, ready, setTheme }}>
      {children}
    </ThemeContext>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme requires ThemeProvider')
  return context
}
