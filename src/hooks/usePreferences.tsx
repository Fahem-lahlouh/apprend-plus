import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Preferences } from '@/models';
import { DEFAULT_PREFERENCES, settingsRepository } from '@/repositories/settingsRepository';
import { applyTheme } from '@/services/themeService';

interface PreferencesContextValue {
  preferences: Preferences;
  ready: boolean;
  update: (patch: Partial<Preferences>) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    settingsRepository.getPreferences().then((prefs) => {
      if (cancelled) return;
      setPreferences(prefs);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => applyTheme(preferences.theme), [preferences.theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-reduce-motion', String(preferences.reduceMotion));
  }, [preferences.reduceMotion]);

  const update = useCallback(async (patch: Partial<Preferences>) => {
    const next = await settingsRepository.savePreferences(patch);
    setPreferences(next);
  }, []);

  const value = useMemo(() => ({ preferences, ready, update }), [preferences, ready, update]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return ctx;
}
