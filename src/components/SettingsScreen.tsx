import type { Preferences } from '../storage/preferences';

interface SettingsScreenProps {
  preferences: Preferences;
  onChange: (prefs: Partial<Preferences>) => void;
  onClose: () => void;
  className?: string;
}

export function SettingsScreen({
  preferences,
  onChange,
  onClose,
  className = '',
}: SettingsScreenProps) {
  return (
    <div className={`settings-screen ${className}`} role="dialog" aria-modal="true">
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="btn-close" onClick={onClose} aria-label="Close settings">×</button>
      </div>
      <div className="settings-list">
        <div className="setting-item">
          <label>
            <span>Bot Difficulty</span>
            <select
              value={preferences.botDifficulty}
              onChange={(e) => onChange({ botDifficulty: e.target.value as Preferences['botDifficulty'] })}
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.soundEnabled}
              onChange={(e) => onChange({ soundEnabled: e.target.checked })}
            />
            <span>Sound Effects</span>
          </label>
        </div>
        <div className="setting-item">
          <label>
            <span>Sort Preference</span>
            <select
              value={preferences.sortPreference}
              onChange={(e) => onChange({ sortPreference: e.target.value as Preferences['sortPreference'] })}
            >
              <option value="suit">By Suit</option>
              <option value="rank">By Rank</option>
            </select>
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.animationsEnabled}
              onChange={(e) => onChange({ animationsEnabled: e.target.checked })}
            />
            <span>Animations</span>
          </label>
        </div>
      </div>
      <button className="btn btn-primary" onClick={onClose}>Done</button>
    </div>
  );
}