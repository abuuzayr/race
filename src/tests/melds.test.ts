import { describe, it, expect } from 'vitest';
import { createCard } from '../game/cards';
import { malaysiaStandard } from '../game/rules';
import {
  isRun,
  isSet,
  isValidMeld,
  findAllMelds,
} from '../game/melds';

const rules = malaysiaStandard;

describe('melds', () => {
  describe('isRun', () => {
    it('validates 3-card run same suit', () => {
      const cards = [
        createCard('spades', '3'),
        createCard('spades', '4'),
        createCard('spades', '5'),
      ];
      expect(isRun(cards, rules)).toBe(true);
    });

    it('validates 4-card run same suit', () => {
      const cards = [
        createCard('hearts', '7'),
        createCard('hearts', '8'),
        createCard('hearts', '9'),
        createCard('hearts', '10'),
      ];
      expect(isRun(cards, rules)).toBe(true);
    });

    it('rejects mixed-suit runs', () => {
      const cards = [
        createCard('spades', '3'),
        createCard('hearts', '4'),
        createCard('spades', '5'),
      ];
      expect(isRun(cards, rules)).toBe(false);
    });

    it('rejects non-consecutive runs', () => {
      const cards = [
        createCard('spades', '3'),
        createCard('spades', '5'),
        createCard('spades', '6'),
      ];
      expect(isRun(cards, rules)).toBe(false);
    });

    it('rejects K-A-2 with low ace', () => {
      const cards = [
        createCard('spades', 'K'),
        createCard('spades', 'A'),
        createCard('spades', '2'),
      ];
      expect(isRun(cards, rules)).toBe(false);
    });

    it('rejects Q-K-A with low ace', () => {
      const cards = [
        createCard('spades', 'Q'),
        createCard('spades', 'K'),
        createCard('spades', 'A'),
      ];
      expect(isRun(cards, rules)).toBe(false);
    });

    it('accepts A-2-3 with low ace', () => {
      const cards = [
        createCard('spades', 'A'),
        createCard('spades', '2'),
        createCard('spades', '3'),
      ];
      expect(isRun(cards, rules)).toBe(true);
    });

    it('accepts A-2-3-4 with low ace', () => {
      const cards = [
        createCard('spades', 'A'),
        createCard('spades', '2'),
        createCard('spades', '3'),
        createCard('spades', '4'),
      ];
      expect(isRun(cards, rules)).toBe(true);
    });

    it('rejects wrong length', () => {
      const cards = [createCard('spades', '3'), createCard('spades', '4')];
      expect(isRun(cards, rules)).toBe(false);
    });
  });

  describe('isSet', () => {
    it('validates 3-card set', () => {
      const cards = [
        createCard('spades', '7'),
        createCard('hearts', '7'),
        createCard('diamonds', '7'),
      ];
      expect(isSet(cards, rules)).toBe(true);
    });

    it('validates 4-card set', () => {
      const cards = [
        createCard('spades', 'Q'),
        createCard('hearts', 'Q'),
        createCard('diamonds', 'Q'),
        createCard('clubs', 'Q'),
      ];
      expect(isSet(cards, rules)).toBe(true);
    });

    it('rejects mixed-rank sets', () => {
      const cards = [
        createCard('spades', '7'),
        createCard('hearts', '8'),
        createCard('diamonds', '7'),
      ];
      expect(isSet(cards, rules)).toBe(false);
    });

    it('rejects duplicate suits in set', () => {
      const cards = [
        createCard('spades', '7'),
        createCard('spades', '7'),
        createCard('diamonds', '7'),
      ];
      expect(isSet(cards, rules)).toBe(false);
    });

    it('rejects wrong length', () => {
      const cards = [createCard('spades', '7'), createCard('hearts', '7')];
      expect(isSet(cards, rules)).toBe(false);
    });
  });

  describe('isValidMeld', () => {
    it('identifies valid run', () => {
      const cards = [
        createCard('spades', '3'),
        createCard('spades', '4'),
        createCard('spades', '5'),
      ];
      const meld = isValidMeld(cards, rules);
      expect(meld).not.toBeNull();
      expect(meld?.type).toBe('run');
    });

    it('identifies valid set', () => {
      const cards = [
        createCard('spades', '7'),
        createCard('hearts', '7'),
        createCard('diamonds', '7'),
      ];
      const meld = isValidMeld(cards, rules);
      expect(meld).not.toBeNull();
      expect(meld?.type).toBe('set');
    });

    it('returns null for invalid', () => {
      const cards = [
        createCard('spades', '3'),
        createCard('hearts', '4'),
        createCard('spades', '5'),
      ];
      expect(isValidMeld(cards, rules)).toBeNull();
    });
  });

  describe('findAllMelds', () => {
    it('finds all melds in hand', () => {
      const cards = [
        createCard('spades', '3'),
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('hearts', '7'),
        createCard('diamonds', '7'),
        createCard('clubs', '7'),
      ];
      const melds = findAllMelds(cards, rules);
      expect(melds.length).toBe(2);
      expect(melds.some(m => m.type === 'run')).toBe(true);
      expect(melds.some(m => m.type === 'set')).toBe(true);
    });
  });
});