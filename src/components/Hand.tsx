import { useState, useEffect } from 'react';
import type { Card } from '../game/cards';
import { CardComponent } from './Card';

interface HandProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
  selectedCard?: Card | null;
  canSelect?: boolean;
  sortBy?: 'suit' | 'rank';
  className?: string;
}

export function Hand({
  cards,
  onCardClick,
  selectedCard,
  canSelect = true,
  sortBy = 'suit',
  className = '',
}: HandProps) {
  const [sortedCards, setSortedCards] = useState<Card[]>(cards);

  useEffect(() => {
    const sorted = [...cards].sort((a, b) => {
      if (sortBy === 'suit') {
        const suitOrder: Record<Card['suit'], number> = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
        if (suitOrder[a.suit] !== suitOrder[b.suit]) {
          return suitOrder[a.suit] - suitOrder[b.suit];
        }
        return rankValue(a.rank) - rankValue(b.rank);
      } else {
        const rankDiff = rankValue(a.rank) - rankValue(b.rank);
        if (rankDiff !== 0) return rankDiff;
        const suitOrder: Record<Card['suit'], number> = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
    });
    setSortedCards(sorted);
  }, [cards, sortBy]);

  return (
    <div className={`hand ${className}`} role="list" aria-label="Your hand">
      {sortedCards.map((card, index) => (
        <CardComponent
          key={card.id}
          card={card}
          faceUp={true}
          selected={selectedCard?.id === card.id && canSelect}
          onClick={() => canSelect && onCardClick(card)}
          className={index === sortedCards.length - 1 ? 'last-card' : ''}
        />
      ))}
    </div>
  );
}

function rankValue(rank: Card['rank']): number {
  const values: Record<Card['rank'], number> = {
    A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13
  };
  return values[rank];
}