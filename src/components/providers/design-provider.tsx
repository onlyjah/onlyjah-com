import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { DesignPreset } from '@/lib/design'
import { useTheme } from './theme-provider'

const DesignContext = createContext<{
  presets: readonly DesignPreset[]
  selected: string
  select: (id: string) => void
} | null>(null)

/** Presentation preference only: never account permissions or database state. */
export function DesignProvider({
  children,
  presets,
  storageKey = 'ui-design',
  defaultId = 'roots',
}: {
  children: ReactNode
  presets: readonly DesignPreset[]
  storageKey?: string
  defaultId?: string
}) {
  const { resolvedTheme, ready } = useTheme()
  const [selected, setSelected] = useState(defaultId)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const restore = () => {
      try {
        const saved = localStorage.getItem(storageKey)
        setSelected(
          presets.some((preset) => preset.id === saved)
            ? (saved as string)
            : defaultId,
        )
      } catch {
        setSelected(defaultId)
      }
    }
    restore()
    setLoaded(true)
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey) restore()
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [storageKey, presets, defaultId])
  useEffect(() => {
    if (!ready || !loaded) return
    const preset = presets.find((value) => value.id === selected)
    if (!preset) return
    const root = document.documentElement
    const tokens = resolvedTheme === 'dark' ? preset.dark : preset.light
    const keys = new Set(
      presets.flatMap((value) => [
        ...Object.keys(value.light),
        ...Object.keys(value.dark),
      ]),
    )
    for (const key of keys) {
      if (tokens[key]) root.style.setProperty(key, tokens[key])
      else root.style.removeProperty(key)
    }
    root.dataset.design = preset.id
  }, [selected, presets, resolvedTheme, ready, loaded])
  function select(id: string) {
    if (!presets.some((preset) => preset.id === id)) return
    setSelected(id)
    try {
      localStorage.setItem(storageKey, id)
    } catch {
      /* A blocked store still permits a local preview. */
    }
  }
  return (
    <DesignContext value={{ presets, selected, select }}>
      {children}
    </DesignContext>
  )
}
export function useDesign() {
  const value = useContext(DesignContext)
  if (!value) throw new Error('useDesign requires DesignProvider')
  return value
}
