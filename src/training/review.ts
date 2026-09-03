import type { DecisionRecord } from './decisions';
import type { Card } from '../game/cards';

export interface ReviewItem {
  turn: number;
  message: string;
  type: 'good' | 'suboptimal' | 'mistake';
}

export type { DecisionRecord } from './decisions';

export function generateReviewItems(decisions: DecisionRecord[]): ReviewItem[] {
  const items: ReviewItem[] = [];

  for (const d of decisions) {
    if (d.phase === 'discard' && d.discardedCard && d.evaluatorRecommendation.recommendedDiscard) {
      const rec = d.evaluatorRecommendation.recommendedDiscard;
      if (d.discardedCard.id !== rec.id) {
        items.push({
          turn: d.turn,
          message: `You discarded ${cardToString(d.discardedCard)}. Better: ${cardToString(rec)}. ${d.evaluatorRecommendation.reasoning}`,
          type: 'suboptimal',
        });
      } else {
        items.push({
          turn: d.turn,
          message: `Good discard: ${cardToString(d.discardedCard)}. ${d.evaluatorRecommendation.reasoning}`,
          type: 'good',
        });
      }
    }

    if (d.phase === 'draw' && d.action.type === 'MAKAN' && d.acquiredCard) {
      items.push({
        turn: d.turn,
        message: `Good Makan! Taking ${cardToString(d.acquiredCard)} completed your sequence.`,
        type: 'good',
      });
    }

    if (d.phase === 'draw' && d.action.type === 'DRAW_STOCK' && d.acquiredCard) {
      const handAfterDraw = [...d.handBefore, d.acquiredCard];
      const ranked = rankDiscardOptionsForReview(handAfterDraw, d.visibleCards);
      if (ranked.length > 0 && ranked[0].card.id === d.acquiredCard.id) {
        items.push({
          turn: d.turn,
          message: `Good draw! ${cardToString(d.acquiredCard)} was a valuable card.`,
          type: 'good',
        });
      }
    }
  }

  return items;
}

function rankDiscardOptionsForReview(
  hand: Card[],
  _visibleCards: Card[]
): Array<{ card: Card; reason: string }> {
  const byRank = new Map<string, Card[]>();
  for (const card of hand) {
    const arr = byRank.get(card.rank) || [];
    arr.push(card);
    byRank.set(card.rank, arr);
  }

  const results: Array<{ card: Card; reason: string }> = [];

  for (const card of hand) {
    const sameRank = hand.filter(c => c.rank === card.rank && c.id !== card.id).length;
    const sameSuit = hand.filter(c => c.suit === card.suit && c.id !== card.id);

    let reason = '';
    let score = 0;

    if (sameRank >= 2) {
      reason = 'Part of a set';
      score = 100;
    } else if (sameRank === 1) {
      reason = 'Pair potential';
      score = 50;
    }

    for (const other of sameSuit) {
      const val1 = rankToValue(card.rank);
      const val2 = rankToValue(other.rank);
      const diff = Math.abs(val1 - val2);
      if (diff === 1) {
        reason += (reason ? ', ' : '') + 'Consecutive run';
        score += 30;
      } else if (diff === 2) {
        reason += (reason ? ', ' : '') + 'One-gap run';
        score += 15;
      }
    }

    if (score > 0) {
      results.push({ card, reason: reason || 'Isolated' });
    }
  }

  return results.sort((a, b) => b.reason.length - a.reason.length);
}

function rankToValue(rank: Card['rank']): number {
  const values: Record<Card['rank'], number> = {
    A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13
  };
  return values[rank];
}

function cardToString(card: { suit: string; rank: string }): string {
  const suitSymbols: Record<string, string> = {
    spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣'
  };
  return `${card.rank}${suitSymbols[card.suit] || card.suit}`;
}