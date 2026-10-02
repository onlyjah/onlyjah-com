export type Theme = 'light' | 'dark' | 'system'
export const themeStorageKey = 'onlyjah-theme'

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

// Run before CSS paints. This fixed script contains no user content or credentials.
// React hydrates the same markup; only the root theme class is changed early.
export const themeInitScript = `(() => {
  let theme = 'system';
  try {
    const saved = localStorage.getItem('${themeStorageKey}');
    if (['light', 'dark', 'system'].includes(saved)) theme = saved;
  } catch {}
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
})();`
