import type { GameStats } from '../storage/stats';
import { getWinRate, getAverageTurns, getMakanFrequency } from '../storage/stats';

interface StatsScreenProps {
  stats: GameStats;
  onClose: () => void;
  onReset: () => void;
  className?: string;
}

export function StatsScreen({
  stats,
  onClose,
  onReset,
  className = '',
}: StatsScreenProps) {
  const winRate = getWinRate(stats);
  const avgTurns = getAverageTurns(stats);
  const makanFreq = getMakanFrequency(stats);

  return (
    <div className={`stats-screen ${className}`} role="dialog" aria-modal="true">
      <div className="stats-header">
        <h2>Statistics</h2>
        <button className="btn-close" onClick={onClose} aria-label="Close stats">×</button>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.gamesPlayed}</div>
          <div className="stat-label">Games Played</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.gamesWon}</div>
          <div className="stat-label">Games Won</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(winRate * 100).toFixed(1)}%</div>
          <div className="stat-label">Win Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.kadangWins}</div>
          <div className="stat-label">Kadang Wins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.sampaiWins}</div>
          <div className="stat-label">Sampai Wins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.kecikMataResults}</div>
          <div className="stat-label">Kecik Mata</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgTurns.toFixed(1)}</div>
          <div className="stat-label">Avg Turns/Game</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(makanFreq * 100).toFixed(1)}%</div>
          <div className="stat-label">Makan Frequency</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(stats.optimalDiscardRate * 100).toFixed(1)}%</div>
          <div className="stat-label">Optimal Discards</div>
        </div>
      </div>
      <div className="stats-actions">
        <button className="btn btn-danger" onClick={onReset}>Reset Statistics</button>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}