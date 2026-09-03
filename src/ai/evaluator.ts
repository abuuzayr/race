import type { Card } from '../game/cards';
import type { RaceRules } from '../game/rules';
import { findAllMelds } from '../game/melds';

export interface HandEvaluation {
  completedMelds: { type: 'run' | 'set'; cards: Card[] }[];
  pairs: Card[][];
  sequences: Card[][];
  oneGapSequences: Card[][];
  multiPotentialCards: Card[];
  isolatedCards: Card[];
  deadCards: Card[];
  totalScore: number;
}

export function evaluateHand(
  cards: Card[],
  visibleCards: Card[],
  rules: RaceRules
): HandEvaluation {
  const melds = findAllMelds(cards, rules);

  const completedMelds = melds.map(m => ({ type: m.type, cards: m.cards }));

  const pairs = findPairs(cards);
  const sequences = findSequences(cards, rules);
  const oneGapSequences = findOneGapSequences(cards, rules);

  const cardPotential = calculateCardPotential(cards, visibleCards, rules);
  const multiPotentialCards = cards.filter(c => cardPotential.get(c.id) !== undefined && (cardPotential.get(c.id) || 0) > 1);
  const isolatedCards = cards.filter(c => (cardPotential.get(c.id) || 0) === 0);
  const deadCards = findDeadCards(cards, visibleCards, rules);

  const totalScore = calculateHandScore(cards, completedMelds, pairs, sequences, oneGapSequences);

  return {
    completedMelds,
    pairs,
    sequences,
    oneGapSequences,
    multiPotentialCards,
    isolatedCards,
    deadCards,
    totalScore,
  };
}

function findPairs(cards: Card[]): Card[][] {
  const byRank = new Map<string, Card[]>();
  for (const card of cards) {
    const arr = byRank.get(card.rank) || [];
    arr.push(card);
    byRank.set(card.rank, arr);
  }
  return Array.from(byRank.values()).filter(arr => arr.length >= 2);
}

function findSequences(cards: Card[], rules: RaceRules): Card[][] {
  const sequences: Card[][] = [];
  const bySuit = new Map<Card['suit'], Card[]>();

  for (const card of cards) {
    const arr = bySuit.get(card.suit) || [];
    arr.push(card);
    bySuit.set(card.suit, arr);
  }

  for (const suitCards of bySuit.values()) {
    const sorted = [...suitCards].sort((a, b) =>
      rankToValue(a.rank, rules.aceMode) - rankToValue(b.rank, rules.aceMode)
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const val1 = rankToValue(sorted[i].rank, rules.aceMode);
      const val2 = rankToValue(sorted[i + 1].rank, rules.aceMode);
      if (val2 === val1 + 1) {
        sequences.push([sorted[i], sorted[i + 1]]);
      }
    }
  }

  return sequences;
}

function findOneGapSequences(cards: Card[], rules: RaceRules): Card[][] {
  const sequences: Card[][] = [];
  const bySuit = new Map<Card['suit'], Card[]>();

  for (const card of cards) {
    const arr = bySuit.get(card.suit) || [];
    arr.push(card);
    bySuit.set(card.suit, arr);
  }

  for (const suitCards of bySuit.values()) {
    const sorted = [...suitCards].sort((a, b) =>
      rankToValue(a.rank, rules.aceMode) - rankToValue(b.rank, rules.aceMode)
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const val1 = rankToValue(sorted[i].rank, rules.aceMode);
      const val2 = rankToValue(sorted[i + 1].rank, rules.aceMode);
      if (val2 === val1 + 2) {
        sequences.push([sorted[i], sorted[i + 1]]);
      }
    }
  }

  return sequences;
}

function calculateCardPotential(
  cards: Card[],
  visibleCards: Card[],
  rules: RaceRules
): Map<string, number> {
  const potential = new Map<string, number>();

  for (const card of cards) {
    let count = 0;

    const sameRank = cards.filter(c => c.rank === card.rank && c.id !== card.id).length;
    const visibleSameRank = visibleCards.filter(c => c.rank === card.rank).length;
    if (sameRank >= 1 && sameRank + visibleSameRank < 4) count++;

    const sameSuit = cards.filter(c => c.suit === card.suit && c.id !== card.id);
    for (const other of sameSuit) {
      const val1 = rankToValue(card.rank, rules.aceMode);
      const val2 = rankToValue(other.rank, rules.aceMode);
      const diff = Math.abs(val1 - val2);
      if (diff === 1 || diff === 2) {
        const neededRank = diff === 1
          ? (val1 < val2 ? val1 - 1 : val2 + 1)
          : (val1 + val2) / 2;
        if (neededRank >= 1 && neededRank <= 13) {
          const neededCardExists = [...cards, ...visibleCards].some(
            c => c.suit === card.suit && rankToValue(c.rank, rules.aceMode) === neededRank
          );
          if (!neededCardExists) count++;
        }
      }
    }

    potential.set(card.id, count);
  }

  return potential;
}

function findDeadCards(cards: Card[], visibleCards: Card[], rules: RaceRules): Card[] {
  return cards.filter(card => {
    const sameRankVisible = visibleCards.filter(c => c.rank === card.rank).length;
    const sameRankInHand = cards.filter(c => c.rank === card.rank).length;
    if (sameRankInHand + sameRankVisible >= 4) return true;

    const sameSuitVisible = visibleCards.filter(c => c.suit === card.suit);
    const val = rankToValue(card.rank, rules.aceMode);
    const neededForRun = [val - 2, val - 1, val + 1, val + 2].filter(v => v >= 1 && v <= 13);
    const hasRunPotential = neededForRun.some(v =>
      !sameSuitVisible.some(c => rankToValue(c.rank, rules.aceMode) === v) &&
      !cards.some(c => c.suit === card.suit && rankToValue(c.rank, rules.aceMode) === v)
    );
    return !hasRunPotential && sameRankInHand + sameRankVisible >= 3;
  });
}

function calculateHandScore(
  cards: Card[],
  melds: { type: 'run' | 'set'; cards: Card[] }[],
  pairs: Card[][],
  sequences: Card[][],
  oneGapSequences: Card[][]
): number {
  let score = 0;
  score += melds.length * 50;
  score += pairs.length * 10;
  score += sequences.length * 8;
  score += oneGapSequences.length * 5;

  const meldCards = new Set(melds.flatMap(m => m.cards.map(c => c.id)));
  const unmatchedCards = cards.filter(c => !meldCards.has(c.id));
  score -= unmatchedCards.length * 2;

  return score;
}

function rankToValue(rank: Card['rank'], aceMode: 'low' | 'high' | 'low_or_high'): number {
  const values: Record<Card['rank'], number> = {
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

export function rankDiscardOptions(
  hand: Card[],
  visibleCards: Card[],
  rules: RaceRules
): Array<{ card: Card; score: number; reason: string }> {
  const results = [];

  for (const card of hand) {
    const remaining = hand.filter(c => c.id !== card.id);
    const evalResult = evaluateHand(remaining, visibleCards, rules);
    const deadPenalty = evalResult.deadCards.some(c => c.id === card.id) ? 20 : 0;
    const isolatedPenalty = evalResult.isolatedCards.some(c => c.id === card.id) ? 10 : 0;
    const multiPotentialBonus = evalResult.multiPotentialCards.some(c => c.id === card.id) ? -15 : 0;

    const score = -evalResult.totalScore + deadPenalty + isolatedPenalty + multiPotentialBonus;

    let reason = '';
    if (deadPenalty) reason += 'Dead card. ';
    if (isolatedPenalty) reason += 'Isolated. ';
    if (multiPotentialBonus) reason += 'Multi-potential. ';

    results.push({ card, score, reason: reason.trim() || 'Standard discard' });
  }

  return results.sort((a, b) => a.score - b.score);
}