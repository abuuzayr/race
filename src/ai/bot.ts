import type { GameState, GameAction, PlayerId } from '../game/state';
import type { RaceRules } from '../game/rules';
import type { Card } from '../game/cards';
import { evaluateHand, rankDiscardOptions } from './evaluator';
import { hasWinningHand } from '../game/engine';

export type BotDifficulty = 'easy' | 'normal' | 'hard';

export interface BotDecision {
  action: GameAction;
  reasoning: string;
}

export function createBot(
  difficulty: BotDifficulty = 'normal',
  playerId: PlayerId
): (state: GameState) => BotDecision {
  return (state: GameState) => {
    const player = state.players.find(p => p.id === playerId)!;
    const visibleCards = getVisibleCards(state, playerId);

    if (player.cards.length === 8) {
      return chooseDiscard(player, visibleCards, state.rules, difficulty);
    }

    if (state.phase === 'playing' || state.phase === 'kopek') {
      return chooseDrawOrMakan(player, visibleCards, state, difficulty);
    }

    return { action: { type: 'DRAW_STOCK', playerId }, reasoning: 'Default action' };
  };
}

function getVisibleCards(state: GameState, playerId: PlayerId): Card[] {
  const visible: Card[] = [...state.discardPile];

  for (const p of state.players) {
    if (p.id !== playerId && !p.isHuman) {
    }
  }

  return visible;
}

function chooseDrawOrMakan(
  player: { cards: Card[]; id: PlayerId },
  visibleCards: Card[],
  state: GameState,
  difficulty: BotDifficulty
): BotDecision {
  const canMakan = state.discardPile.length > 0 && player.cards.length === 7;
  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const canDraw = state.stock.length > 0 && player.cards.length === 7;

  if (canMakan && topDiscard) {
    const testHand = [...player.cards, topDiscard];

    if (hasWinningHand(testHand, state.rules)) {
      return {
        action: { type: 'MAKAN', playerId: player.id },
        reasoning: 'Makan completes winning hand',
      };
    }

    const evalAfterMakan = evaluateHand(testHand, visibleCards, state.rules);
    const evalCurrent = evaluateHand(player.cards, visibleCards, state.rules);

    const makanValue = evalAfterMakan.totalScore - evalCurrent.totalScore;

    if (difficulty === 'easy') {
      if (Math.random() < 0.3) {
        return { action: { type: 'DRAW_STOCK', playerId: player.id }, reasoning: 'Easy: random draw' };
      }
    }

    if (difficulty === 'hard') {
      const discardProb = estimateDiscardProbability(topDiscard, state, player.id);
      if (discardProb > 0.7 && makanValue > 5) {
        return {
          action: { type: 'MAKAN', playerId: player.id },
          reasoning: `Hard: high probability discard, value ${makanValue}`,
        };
      }
    }

    if (makanValue > 0) {
      return {
        action: { type: 'MAKAN', playerId: player.id },
        reasoning: `Makan improves hand by ${makanValue}`,
      };
    }
  }

  if (canDraw) {
    return { action: { type: 'DRAW_STOCK', playerId: player.id }, reasoning: 'Draw from stock' };
  }

  return { action: { type: 'DRAW_STOCK', playerId: player.id }, reasoning: 'No valid action' };
}

function chooseDiscard(
  player: { cards: Card[]; id: PlayerId },
  visibleCards: Card[],
  rules: RaceRules,
  difficulty: BotDifficulty
): BotDecision {
  const ranked = rankDiscardOptions(player.cards, visibleCards, rules);

  if (difficulty === 'easy') {
    const index = Math.min(Math.floor(Math.random() * 3), ranked.length - 1);
    const choice = ranked[index];
    return {
      action: { type: 'DISCARD', playerId: player.id, cardId: choice.card.id },
      reasoning: `Easy: ${choice.reason}`,
    };
  }

  if (difficulty === 'hard') {
    const best = ranked[0];
    return {
      action: { type: 'DISCARD', playerId: player.id, cardId: best.card.id },
      reasoning: `Hard: ${best.reason}`,
    };
  }

  const best = ranked[0];
  return {
    action: { type: 'DISCARD', playerId: player.id, cardId: best.card.id },
    reasoning: `Normal: ${best.reason}`,
  };
}

function estimateDiscardProbability(
  card: Card,
  state: GameState,
  botId: PlayerId
): number {
  let knownCount = 0;
  for (const c of state.discardPile) {
    if (c.rank === card.rank) knownCount++;
  }
  for (const p of state.players) {
    if (p.id !== botId && !p.isHuman) {
    }
  }
  return knownCount / 4;
}