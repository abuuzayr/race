import { describe, it, expect } from 'vitest';
import {
  createCard,
  createDeck,
  shuffleDeck,
  rankToValue,
  cardsEqual,
  cardToString,
  compareCards,
} from '../game/cards';

describe('cards', () => {
  describe('createCard', () => {
    it('creates a card with correct id', () => {
      const card = createCard('spades', 'A');
      expect(card.id).toBe('A_of_spades');
      expect(card.suit).toBe('spades');
      expect(card.rank).toBe('A');
    });
  });

  describe('createDeck', () => {
    it('creates a 52-card deck', () => {
      const deck = createDeck();
      expect(deck.length).toBe(52);
    });

    it('has all suits and ranks', () => {
      const deck = createDeck();
      const suits = new Set(deck.map(c => c.suit));
      const ranks = new Set(deck.map(c => c.rank));
      expect(suits.size).toBe(4);
      expect(ranks.size).toBe(13);
    });

    it('has unique cards', () => {
      const deck = createDeck();
      const ids = new Set(deck.map(c => c.id));
      expect(ids.size).toBe(52);
    });
  });

  describe('shuffleDeck', () => {
    it('returns same length array', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck, () => 0.5);
      expect(shuffled.length).toBe(52);
    });

    it('is deterministic with seeded random', () => {
      const deck = createDeck();
      const random = () => 0.5;
      const s1 = shuffleDeck(deck, random);
      const s2 = shuffleDeck(deck, random);
      expect(s1.map(c => c.id)).toEqual(s2.map(c => c.id));
    });

    it('does not modify original', () => {
      const deck = createDeck();
      const original = [...deck];
      shuffleDeck(deck);
      expect(deck.map(c => c.id)).toEqual(original.map(c => c.id));
    });
  });

  describe('rankToValue', () => {
    it('returns correct values for low ace', () => {
      expect(rankToValue('A', 'low')).toBe(1);
      expect(rankToValue('2', 'low')).toBe(2);
      expect(rankToValue('K', 'low')).toBe(13);
    });

    it('returns correct values for high ace', () => {
      expect(rankToValue('A', 'high')).toBe(14);
      expect(rankToValue('K', 'high')).toBe(13);
    });
  });

  describe('cardsEqual', () => {
    it('returns true for same card', () => {
      const c1 = createCard('spades', 'A');
      const c2 = createCard('spades', 'A');
      expect(cardsEqual(c1, c2)).toBe(true);
    });

    it('returns false for different cards', () => {
      const c1 = createCard('spades', 'A');
      const c2 = createCard('hearts', 'A');
      expect(cardsEqual(c1, c2)).toBe(false);
    });
  });

  describe('cardToString', () => {
    it('formats cards correctly', () => {
      expect(cardToString(createCard('spades', 'A'))).toBe('A♠');
      expect(cardToString(createCard('hearts', '10'))).toBe('10♥');
      expect(cardToString(createCard('diamonds', 'K'))).toBe('K♦');
      expect(cardToString(createCard('clubs', '2'))).toBe('2♣');
    });
  });

  describe('compareCards', () => {
    it('sorts by rank first', () => {
      const a = createCard('spades', '2');
      const b = createCard('hearts', 'A');
      expect(compareCards(a, b, 'low')).toBeGreaterThan(0);
    });

    it('sorts by suit when rank equal', () => {
      const a = createCard('hearts', 'A');
      const b = createCard('spades', 'A');
      expect(compareCards(a, b, 'low')).toBeGreaterThan(0);
    });
  });
});