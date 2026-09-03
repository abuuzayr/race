import type { Card } from './cards';
import type { RaceRules } from './rules';
import type { Meld } from './melds';
import { isValidMeld, getCombinations } from './melds';

export type WinReason = 'kadang' | 'sampai' | 'kecik_mata';

export interface WinningHand {
  fourCardMeld: Meld;
  threeCardMeld: Meld;
  reason: WinReason;
}

export function detectWinningHand(
  cards: Card[],
  rules: RaceRules,
  reason: WinReason = 'kadang'
): WinningHand | null {
  if (cards.length !== 7) return null;

  const fourCardCombos = getCombinations(cards, 4);

  for (const fourCards of fourCardCombos) {
    const fourMeld = isValidMeld(fourCards, rules);
    if (!fourMeld) continue;

    const remainingCards = cards.filter(c => !fourCards.some(fc => fc.id === c.id));
    const threeMeld = isValidMeld(remainingCards, rules);
    if (!threeMeld) continue;

    return {
      fourCardMeld: fourMeld,
      threeCardMeld: threeMeld,
      reason,
    };
  }

  return null;
}

export function hasWinningHand(cards: Card[], rules: RaceRules): boolean {
  return detectWinningHand(cards, rules) !== null;
}