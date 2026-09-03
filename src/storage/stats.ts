export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  kadangWins: number;
  sampaiWins: number;
  kecikMataResults: number;
  totalTurns: number;
  makanCount: number;
  drawCount: number;
  optimalDiscardRate: number;
  totalDiscards: number;
  optimalDiscards: number;
}

const STATS_KEY = 'race_game_stats';

const defaultStats: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  kadangWins: 0,
  sampaiWins: 0,
  kecikMataResults: 0,
  totalTurns: 0,
  makanCount: 0,
  drawCount: 0,
  optimalDiscardRate: 0,
  totalDiscards: 0,
  optimalDiscards: 0,
};

export function loadStats(): GameStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? { ...defaultStats, ...JSON.parse(data) } : defaultStats;
  } catch {
    return defaultStats;
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to save stats:', e);
  }
}

export function recordGameResult(
  stats: GameStats,
  won: boolean,
  winReason: 'kadang' | 'sampai' | 'kecik_mata' | null,
  turns: number,
  makanCount: number,
  drawCount: number,
  optimalDiscards: number,
  totalDiscards: number
): GameStats {
  const newStats = { ...stats };
  newStats.gamesPlayed += 1;
  newStats.totalTurns += turns;
  newStats.makanCount += makanCount;
  newStats.drawCount += drawCount;
  newStats.totalDiscards += totalDiscards;
  newStats.optimalDiscards += optimalDiscards;

  if (won) {
    newStats.gamesWon += 1;
    if (winReason === 'kadang') newStats.kadangWins += 1;
    else if (winReason === 'sampai') newStats.sampaiWins += 1;
  } else if (winReason === 'kecik_mata') {
    newStats.kecikMataResults += 1;
  }

  newStats.optimalDiscardRate = newStats.totalDiscards > 0
    ? newStats.optimalDiscards / newStats.totalDiscards
    : 0;

  return newStats;
}

export function getWinRate(stats: GameStats): number {
  return stats.gamesPlayed > 0 ? stats.gamesWon / stats.gamesPlayed : 0;
}

export function getAverageTurns(stats: GameStats): number {
  return stats.gamesPlayed > 0 ? stats.totalTurns / stats.gamesPlayed : 0;
}

export function getMakanFrequency(stats: GameStats): number {
  const total = stats.makanCount + stats.drawCount;
  return total > 0 ? stats.makanCount / total : 0;
}

export function resetStats(): GameStats {
  const stats = defaultStats;
  saveStats(stats);
  return stats;
}