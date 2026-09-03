import { describe, it, expect } from 'vitest';
import { createCard } from '../game/cards';
import { malaysiaStandard } from '../game/rules';
import { evaluateHand, rankDiscardOptions } from '../ai/evaluator';
import { createBot } from '../ai/bot';
import type { GameState } from '../game/state';

const rules = malaysiaStandard;

describe('AI evaluator', () => {
  describe('evaluateHand', () => {
    it('identifies completed melds', () => {
      const cards = [
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('spades', '6'),
        createCard('hearts', '7'),
        createCard('diamonds', '7'),
        createCard('clubs', '7'),
      ];
      const evalResult = evaluateHand(cards, [], rules);
      expect(evalResult.completedMelds.length).toBe(2);
    });

    it('identifies pairs', () => {
      const cards = [
        createCard('spades', '7'),
        createCard('hearts', '7'),
        createCard('diamonds', 'K'),
      ];
      const evalResult = evaluateHand(cards, [], rules);
      expect(evalResult.pairs.length).toBe(1);
      expect(evalResult.pairs[0].length).toBe(2);
    });

    it('identifies sequences', () => {
      const cards = [
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('hearts', 'K'),
      ];
      const evalResult = evaluateHand(cards, [], rules);
      expect(evalResult.sequences.length).toBe(1);
    });

    it('identifies one-gap sequences', () => {
      const cards = [
        createCard('spades', '4'),
        createCard('spades', '6'),
        createCard('hearts', 'K'),
      ];
      const evalResult = evaluateHand(cards, [], rules);
      expect(evalResult.oneGapSequences.length).toBe(1);
    });

    it('identifies dead cards', () => {
      const cards = [createCard('spades', '2')];
      const visible = [
        createCard('spades', 'A'),
        createCard('spades', '3'),
        createCard('spades', '4'),
        createCard('hearts', '2'),
        createCard('diamonds', '2'),
        createCard('clubs', '2'),
      ];
      const evalResult = evaluateHand(cards, visible, rules);
      expect(evalResult.deadCards.length).toBe(1);
    });
  });

  describe('rankDiscardOptions', () => {
    it('recommends discarding isolated cards', () => {
      const hand = [
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('hearts', 'K'),
      ];
      const ranked = rankDiscardOptions(hand, [], rules);
      expect(ranked[0].card.rank).toBe('K');
    });

    it('keeps cards with run potential', () => {
      const hand = [
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('spades', '6'),
        createCard('hearts', 'K'),
      ];
      const ranked = rankDiscardOptions(hand, [], rules);
      expect(ranked[0].card.rank).toBe('K');
    });

    it('keeps cards with set potential', () => {
      const hand = [
        createCard('spades', '7'),
        createCard('hearts', '7'),
        createCard('diamonds', 'K'),
      ];
      const ranked = rankDiscardOptions(hand, [], rules);
      expect(ranked[0].card.rank).toBe('K');
    });
  });
});

describe('Bot', () => {
  it('creates bot with difficulty', () => {
    const bot = createBot('normal', 'player_1');
    expect(typeof bot).toBe('function');
  });

  it('bot chooses discard when has 8 cards', () => {
    const bot = createBot('normal', 'player_1');
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8'] as const;
    const mockState = {
      players: [
        { id: 'player_0', cards: [], isHuman: true, isBot: false, name: 'You' },
        { id: 'player_1', cards: ranks.map(r => createCard('spades', r)), isHuman: false, isBot: true, name: 'Bot 1' },
      ],
      currentPlayerIndex: 1,
      phase: 'playing',
      discardPile: [],
      stock: ranks.map(r => createCard('hearts', r)),
      rules: rules,
    } as unknown as GameState;

    const decision = bot(mockState);
    expect(decision.action.type).toBe('DISCARD');
  });

  it('bot chooses makan when it completes winning hand', () => {
    const bot = createBot('normal', 'player_1');
    const winningCard = createCard('spades', '7');
    const hand = [
      createCard('spades', '4'),
      createCard('spades', '5'),
      createCard('spades', '6'),
      createCard('hearts', '9'),
      createCard('diamonds', '9'),
      createCard('clubs', '9'),
      createCard('hearts', 'K'),
    ];

    const mockState = {
      players: [
        { id: 'player_0', cards: [], isHuman: true, isBot: false, name: 'You' },
        { id: 'player_1', cards: hand, isHuman: false, isBot: true, name: 'Bot 1' },
      ],
      currentPlayerIndex: 1,
      phase: 'playing',
      discardPile: [winningCard],
      stock: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(r => createCard('hearts', r as 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10')),
      rules: rules,
    } as unknown as GameState;

    const decision = bot(mockState);
    expect(decision.action.type).toBe('MAKAN');
  });
});