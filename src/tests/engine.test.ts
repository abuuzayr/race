import { describe, it, expect } from 'vitest';
import { createCard } from '../game/cards';
import { malaysiaStandard } from '../game/rules';
import { detectWinningHand, hasWinningHand } from '../game/engine';

const rules = malaysiaStandard;

describe('engine - winning hand detection', () => {
  describe('run4 + run3', () => {
    it('detects 4♠5♠6♠7♠ + 9♥9♦9♣', () => {
      const cards = [
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('spades', '6'),
        createCard('spades', '7'),
        createCard('hearts', '9'),
        createCard('diamonds', '9'),
        createCard('clubs', '9'),
      ];
      const result = detectWinningHand(cards, rules);
      expect(result).not.toBeNull();
      expect(result?.fourCardMeld.type).toBe('run');
      expect(result?.threeCardMeld.type).toBe('set');
    });

    it('detects run4 + run3 regardless of order', () => {
      const cards = [
        createCard('hearts', '9'),
        createCard('spades', '4'),
        createCard('diamonds', '9'),
        createCard('spades', '5'),
        createCard('clubs', '9'),
        createCard('spades', '6'),
        createCard('spades', '7'),
      ];
      const result = detectWinningHand(cards, rules);
      expect(result).not.toBeNull();
    });
  });

  describe('run4 + set3', () => {
    it('detects 4♠5♠6♠7♠ + 9♥9♦9♣', () => {
      const cards = [
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('spades', '6'),
        createCard('spades', '7'),
        createCard('hearts', '9'),
        createCard('diamonds', '9'),
        createCard('clubs', '9'),
      ];
      const result = detectWinningHand(cards, rules);
      expect(result).not.toBeNull();
      expect(result?.fourCardMeld.type).toBe('run');
      expect(result?.threeCardMeld.type).toBe('set');
    });
  });

  describe('set4 + run3', () => {
    it('detects Q♠Q♥Q♦Q♣ + 4♠5♠6♠', () => {
      const cards = [
        createCard('spades', 'Q'),
        createCard('hearts', 'Q'),
        createCard('diamonds', 'Q'),
        createCard('clubs', 'Q'),
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('spades', '6'),
      ];
      const result = detectWinningHand(cards, rules);
      expect(result).not.toBeNull();
      expect(result?.fourCardMeld.type).toBe('set');
      expect(result?.threeCardMeld.type).toBe('run');
    });
  });

  describe('set4 + set3', () => {
    it('detects 7♠7♥7♦7♣ + 9♥9♦9♣', () => {
      const cards = [
        createCard('spades', '7'),
        createCard('hearts', '7'),
        createCard('diamonds', '7'),
        createCard('clubs', '7'),
        createCard('hearts', '9'),
        createCard('diamonds', '9'),
        createCard('clubs', '9'),
      ];
      const result = detectWinningHand(cards, rules);
      expect(result).not.toBeNull();
      expect(result?.fourCardMeld.type).toBe('set');
      expect(result?.threeCardMeld.type).toBe('set');
    });
  });

  describe('invalid hands', () => {
    it('rejects hand with no valid partition', () => {
      const cards = [
        createCard('spades', '2'),
        createCard('hearts', '5'),
        createCard('diamonds', '8'),
        createCard('clubs', 'J'),
        createCard('spades', '3'),
        createCard('hearts', '6'),
        createCard('diamonds', '9'),
      ];
      expect(detectWinningHand(cards, rules)).toBeNull();
    });

    it('rejects hand with only one meld', () => {
      const cards = [
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('spades', '6'),
        createCard('spades', '7'),
        createCard('hearts', '2'),
        createCard('diamonds', '5'),
        createCard('clubs', '8'),
      ];
      expect(detectWinningHand(cards, rules)).toBeNull();
    });
  });

  describe('hasWinningHand', () => {
    it('returns true for winning hand', () => {
      const cards = [
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('spades', '6'),
        createCard('spades', '7'),
        createCard('hearts', '9'),
        createCard('diamonds', '9'),
        createCard('clubs', '9'),
      ];
      expect(hasWinningHand(cards, rules)).toBe(true);
    });

    it('returns false for non-winning hand', () => {
      const cards = [
        createCard('spades', '2'),
        createCard('hearts', '5'),
        createCard('diamonds', '8'),
        createCard('clubs', 'J'),
        createCard('spades', '3'),
        createCard('hearts', '6'),
        createCard('diamonds', '9'),
      ];
      expect(hasWinningHand(cards, rules)).toBe(false);
    });
  });

  describe('win reason', () => {
    it('includes reason in result', () => {
      const cards = [
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('spades', '6'),
        createCard('spades', '7'),
        createCard('hearts', '9'),
        createCard('diamonds', '9'),
        createCard('clubs', '9'),
      ];
      const result = detectWinningHand(cards, rules, 'sampai');
      expect(result?.reason).toBe('sampai');
    });
  });
});