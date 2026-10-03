import { useDesign } from '@/components/providers/design-provider'
import { Button } from '@/components/ui/button'

export function DesignSelector({ label }: { label: string }) {
  const { presets, selected, select } = useDesign()
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">{label}</legend>
      {presets.map((preset) => (
        <Button
          key={preset.id}
          type="button"
          variant={selected === preset.id ? 'secondary' : 'outline'}
          aria-pressed={selected === preset.id}
          onClick={() => select(preset.id)}
        >
          {preset.label}
        </Button>
      ))}
    </fieldset>
  )
}
