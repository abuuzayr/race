import type { Card } from '../game/cards';
import type { RaceRules } from '../game/rules';
import type { GameAction } from '../game/state';
import { rankDiscardOptions } from '../ai/evaluator';

export interface DecisionRecord {
  turn: number;
  phase: 'draw' | 'discard';
  handBefore: Card[];
  visibleCards: Card[];
  action: GameAction;
  acquiredCard?: Card;
  discardedCard?: Card;
  evaluatorRecommendation: {
    recommendedDiscard: Card | null;
    reasoning: string;
  };
  wasOptimal: boolean;
}

export interface TrainingData {
  decisions: DecisionRecord[];
  gameResult: 'win' | 'loss';
  winReason?: 'kadang' | 'sampai' | 'kecik_mata';
}

const DECISIONS_KEY = 'race_training_decisions';

export function recordDecision(
  turn: number,
  phase: 'draw' | 'discard',
  handBefore: Card[],
  visibleCards: Card[],
  action: GameAction,
  rules: RaceRules,
  acquiredCard?: Card,
  discardedCard?: Card
): DecisionRecord {
  let recommendedDiscard: Card | null = null;
  let reasoning = '';

  if (phase === 'discard' && handBefore.length === 8) {
    const ranked = rankDiscardOptions(handBefore, visibleCards, rules);
    if (ranked.length > 0) {
      recommendedDiscard = ranked[0].card;
      reasoning = ranked[0].reason;
    }
  }

  const wasOptimal = phase === 'discard'
    ? !!(discardedCard && recommendedDiscard && discardedCard.id === recommendedDiscard.id)
    : true;

  return {
    turn,
    phase,
    handBefore: [...handBefore],
    visibleCards: [...visibleCards],
    action,
    acquiredCard,
    discardedCard,
    evaluatorRecommendation: { recommendedDiscard, reasoning },
    wasOptimal,
  };
}

export function saveDecisions(decisions: DecisionRecord[]): void {
  try {
    localStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions));
  } catch (e) {
    console.warn('Failed to save training decisions:', e);
  }
}

export function loadDecisions(): DecisionRecord[] {
  try {
    const data = localStorage.getItem(DECISIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearDecisions(): void {
  localStorage.removeItem(DECISIONS_KEY);
}

export function generateReview(decisions: DecisionRecord[]): string[] {
  const reviews: string[] = [];

  for (const d of decisions) {
    if (d.phase === 'discard' && d.discardedCard && d.evaluatorRecommendation.recommendedDiscard) {
      const rec = d.evaluatorRecommendation.recommendedDiscard;
      if (d.discardedCard.id !== rec.id) {
        reviews.push(
          `Turn ${d.turn}: You discarded ${cardToString(d.discardedCard)}. ` +
          `Better: ${cardToString(rec)}. ${d.evaluatorRecommendation.reasoning}`
        );
      }
    }

    if (d.phase === 'draw' && d.action.type === 'MAKAN' && d.acquiredCard) {
      reviews.push(
        `Turn ${d.turn}: Good Makan. Taking ${cardToString(d.acquiredCard)} ` +
        `completed your sequence.`
      );
    }
  }

  return reviews;
}

function cardToString(card: Card): string {
  const suitSymbols: Record<Card['suit'], string> = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}