import type { Card } from './cards';
import type { RaceRules } from './rules';
import type { WinningHand } from './engine';

export interface KecikMataResult {
  playerId: string;
  score: number;
  cards: Card[];
}

export function calculateKecikMata(
  players: { id: string; cards: Card[] }[],
  rules: RaceRules
): KecikMataResult[] {
  return players.map(player => ({
    playerId: player.id,
    score: player.cards.reduce((sum, card) => sum + rules.scoring.cardValue(card), 0),
    cards: [...player.cards],
  })).sort((a, b) => a.score - b.score);
}

export function calculateWinScore(winningHand: WinningHand, rules: RaceRules): number {
  let score = 0;
  for (const card of [...winningHand.fourCardMeld.cards, ...winningHand.threeCardMeld.cards]) {
    score += rules.scoring.cardValue(card);
  }
  return score;
}