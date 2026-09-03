import { useState } from 'react';
import { GameScreen } from './GameScreen';
import { StatsScreen } from '../components/StatsScreen';
import { SettingsScreen } from '../components/SettingsScreen';
import { HowToPlayScreen } from '../components/HowToPlayScreen';
import { loadPreferences, loadStats } from '../storage';

interface HomeScreenProps {}

export function HomeScreen(_props: HomeScreenProps) {
  const [screen, setScreen] = useState<'home' | 'game' | 'stats' | 'settings' | 'howto'>('home');
  const preferences = loadPreferences();
  const stats = loadStats();

  return (
    <div className="app">
      {screen === 'home' && (
        <div className="home-screen">
          <header>
            <h1>RACE</h1>
            <p className="tagline">Malaysian/Singaporean Card Game</p>
          </header>
          <main>
            <button className="btn btn-primary btn-large" onClick={() => setScreen('game')}>
              PLAY
            </button>
            <div className="menu-buttons">
              <button className="btn btn-secondary" onClick={() => setScreen('howto')}>
                How to Play
              </button>
              <button className="btn btn-secondary" onClick={() => setScreen('stats')}>
                Statistics
              </button>
              <button className="btn btn-secondary" onClick={() => setScreen('settings')}>
                Settings
              </button>
            </div>
          </main>
        </div>
      )}

      {screen === 'game' && (
        <GameScreen onHome={() => setScreen('home')} />
      )}

      {screen === 'stats' && (
        <StatsScreen
          stats={stats}
          onClose={() => setScreen('home')}
          onReset={() => {
            localStorage.removeItem('race_game_stats');
            setScreen('home');
          }}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          preferences={preferences}
          onChange={(prefs) => {
            const current = loadPreferences();
            localStorage.setItem('race_preferences', JSON.stringify({ ...current, ...prefs }));
          }}
          onClose={() => setScreen('home')}
        />
      )}

      {screen === 'howto' && (
        <HowToPlayScreen onClose={() => setScreen('home')} />
      )}
    </div>
  );
}