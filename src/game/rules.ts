import type { Card, AceMode } from './cards';

export type KopekMode = 'standard' | 'none';

export interface ScoringRules {
  cardValue: (card: Card) => number;
}

export interface RaceRules {
  playerCount: number;
  handSize: number;
  startingHandSize: number;
  winningSplit: [4, 3];
  allowRuns: boolean;
  allowSets: boolean;
  aceMode: AceMode;
  kopekMode: KopekMode;
  kecikMataEnabled: boolean;
  scoring: ScoringRules;
}

export const defaultScoring: ScoringRules = {
  cardValue: (card: Card) => {
    const rankValues: Record<Card['rank'], number> = {
      A: 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      J: 10,
      Q: 10,
      K: 10,
    };
    return rankValues[card.rank];
  },
};

export const malaysiaStandard: RaceRules = {
  playerCount: 4,
  handSize: 7,
  startingHandSize: 8,
  winningSplit: [4, 3],
  allowRuns: true,
  allowSets: true,
  aceMode: 'low',
  kopekMode: 'standard',
  kecikMataEnabled: true,
  scoring: defaultScoring,
};

export function createRules(overrides: Partial<RaceRules> = {}): RaceRules {
  return { ...malaysiaStandard, ...overrides };
}