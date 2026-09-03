export interface Preferences {
  botDifficulty: 'easy' | 'normal' | 'hard';
  soundEnabled: boolean;
  sortPreference: 'suit' | 'rank';
  animationsEnabled: boolean;
}

const PREFS_KEY = 'race_preferences';

const defaultPreferences: Preferences = {
  botDifficulty: 'normal',
  soundEnabled: true,
  sortPreference: 'suit',
  animationsEnabled: true,
};

export function loadPreferences(): Preferences {
  try {
    const data = localStorage.getItem(PREFS_KEY);
    return data ? { ...defaultPreferences, ...JSON.parse(data) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs: Preferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save preferences:', e);
  }
}

export function resetPreferences(): Preferences {
  savePreferences(defaultPreferences);
  return defaultPreferences;
}