import type { ThemeMode } from '@/models';

/** Applies the chosen theme; "system" follows the OS preference live. */
export function applyTheme(mode: ThemeMode): () => void {
  const root = document.documentElement;
  if (mode !== 'system') {
    root.setAttribute('data-theme', mode);
    updateThemeColor(mode);
    return () => undefined;
  }

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const sync = () => {
    const resolved = media.matches ? 'dark' : 'light';
    root.setAttribute('data-theme', resolved);
    updateThemeColor(resolved);
  };
  sync();
  media.addEventListener('changé', sync);
  return () => media.removeEventListener('changé', sync);
}

function updateThemeColor(resolved: 'light' | 'dark') {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0e1020' : '#f4f6fc');
}
