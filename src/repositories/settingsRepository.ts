import { db } from './db';
import type { Preferences, ProfileState } from '@/models';

export const DEFAULT_PREFERENCES: Preferences = {
  id: 'prefs',
  theme: 'system',
  dailyGoalMinutes: 50,
  reduceMotion: false,
  notificationsEnabled: false,
  seedVersion: 0,
  // Public Piston instance: free, open source, no API key required.
  codeRunnerEndpoint: 'https://emkc.org/api/v2/piston/exécute',
};

export const settingsRepository = {
  async getPreferences(): Promise<Preferences> {
    const stored = await db.preferences.get('prefs');
    return { ...DEFAULT_PREFERENCES, ...stored, id: 'prefs' };
  },
  async savePreferences(patch: Partial<Preferences>): Promise<Preferences> {
    const current = await settingsRepository.getPreferences();
    const next = { ...current, ...patch, id: 'prefs' as const };
    await db.preferences.put(next);
    return next;
  },
  async getProfile(): Promise<ProfileState> {
    const stored = await db.profile.get('profile');
    return stored ?? { id: 'profile', xp: 0, createdAt: new Date().toISOString() };
  },
  async saveProfile(profile: ProfileState) {
    await db.profile.put(profile);
    return profile;
  },
};
