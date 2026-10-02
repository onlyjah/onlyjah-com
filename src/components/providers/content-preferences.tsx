import { createContext, type ReactNode, useContext, useState } from 'react'
import { Button } from '@/components/ui/button'

const Preferences = createContext({ mature: false, toggle: () => {} })
export function ContentPreferences({ children }: { children: ReactNode }) {
  const [mature, setMature] = useState(false)
  // Consent starts off for each visit. It controls presentation, not data authorization.
  return (
    <Preferences
      value={{ mature, toggle: () => setMature((current) => !current) }}
    >
      {children}
    </Preferences>
  )
}
export function useContentPreferences() {
  return useContext(Preferences)
}
export function MatureToggle() {
  const { mature, toggle } = useContentPreferences()
  return (
    <Button size="sm" variant="ghost" aria-pressed={mature} onClick={toggle}>
      Mature content: {mature ? 'on' : 'off'}
    </Button>
  )
}
