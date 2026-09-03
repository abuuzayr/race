export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export type AceMode = 'low' | 'high' | 'low_or_high';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createCard(suit: Suit, rank: Rank): Card {
  return {
    id: `${rank}_of_${suit}`,
    suit,
    rank,
  };
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank));
    }
  }
  return deck;
}

export function shuffleDeck<T>(deck: T[], random: () => number = Math.random): T[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function rankToValue(rank: Rank, aceMode: 'low' | 'high' | 'low_or_high' = 'low'): number {
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

export function cardsEqual(a: Card, b: Card): boolean {
  return a.id === b.id;
}

export function cardToString(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

export function compareCards(a: Card, b: Card, aceMode: 'low' | 'high' | 'low_or_high' = 'low'): number {
  const rankDiff = rankToValue(a.rank, aceMode) - rankToValue(b.rank, aceMode);
  if (rankDiff !== 0) return rankDiff;
  const suitOrder: Record<Suit, number> = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
  return suitOrder[a.suit] - suitOrder[b.suit];
}