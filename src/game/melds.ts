import type { Card, Rank, AceMode } from './cards';
import type { RaceRules } from './rules';

export type MeldType = 'run' | 'set';

export interface Meld {
  type: MeldType;
  cards: Card[];
}

export function isRun(cards: Card[], rules: RaceRules): boolean {
  if (!rules.allowRuns) return false;
  if (cards.length < 3 || cards.length > 4) return false;

  const suit = cards[0].suit;
  if (!cards.every(c => c.suit === suit)) return false;

  const values = cards.map(c => rankToValue(c.rank, rules.aceMode)).sort((a, b) => a - b);

  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) return false;
  }

  return true;
}

export function isSet(cards: Card[], rules: RaceRules): boolean {
  if (!rules.allowSets) return false;
  if (cards.length < 3 || cards.length > 4) return false;

  const rank = cards[0].rank;
  if (!cards.every(c => c.rank === rank)) return false;

  const suits = new Set(cards.map(c => c.suit));
  return suits.size === cards.length;
}

export function isValidMeld(cards: Card[], rules: RaceRules): Meld | null {
  if (cards.length === 3 || cards.length === 4) {
    if (isRun(cards, rules)) return { type: 'run', cards: [...cards] };
    if (isSet(cards, rules)) return { type: 'set', cards: [...cards] };
  }
  return null;
}

function rankToValue(rank: Rank, aceMode: AceMode): number {
  const values: Record<Rank, number> = {
    A: aceMode === 'high' ? 14 : 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    J: 11,
    Q: 12,
    K: 13,
  };
  return values[rank];
}

export function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];

  const result: T[][] = [];
  const combination: T[] = [];

  function backtrack(start: number) {
    if (combination.length === k) {
      result.push([...combination]);
      return;
    }
    for (let i = start; i <= arr.length - (k - combination.length); i++) {
      combination.push(arr[i]);
      backtrack(i + 1);
      combination.pop();
    }
  }

  backtrack(0);
  return result;
}

export function findAllMelds(cards: Card[], rules: RaceRules): Meld[] {
  const melds: Meld[] = [];

  for (let size = 3; size <= 4; size++) {
    const combinations = getCombinations(cards, size);
    for (const combo of combinations) {
      const meld = isValidMeld(combo, rules);
      if (meld) melds.push(meld);
    }
  }

  return melds;
}