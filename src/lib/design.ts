export type DesignPreset = {
  id: string
  label: string
  light: Record<string, string>
  dark: Record<string, string>
}

// Serialize fixed, validated style data, not arbitrary scripts or user HTML.
export function designInitScript(
  presets: readonly DesignPreset[],
  storageKey: string,
) {
  const config = JSON.stringify({ presets, storageKey }).replace(
    /</g,
    '\\u003c',
  )
  return `(() => {
    const {presets, storageKey} = ${config};
    let id = presets[0]?.id;
    try { const saved = localStorage.getItem(storageKey); if (presets.some(p => p.id === saved)) id = saved; } catch {}
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    const root = document.documentElement;
    const tokens = root.classList.contains('dark') ? preset.dark : preset.light;
    for (const [key,value] of Object.entries(tokens)) root.style.setProperty(key,value);
    root.dataset.design = id;
  })();`
}
