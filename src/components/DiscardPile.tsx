import type { Card } from '../game/cards';
import { CardComponent } from './Card';

interface DiscardPileProps {
  cards: Card[];
  className?: string;
}

export function DiscardPile({ cards, className = '' }: DiscardPileProps) {
  const topCard = cards[cards.length - 1];

  return (
    <div className={`discard-pile ${className}`} role="region" aria-label="Discard pile">
      <div className="discard-label">DISCARD</div>
      {topCard ? (
        <CardComponent card={topCard} faceUp={true} className="discard-top" />
      ) : (
        <div className="discard-empty">No discards</div>
      )}
      {cards.length > 1 && (
        <div className="discard-count">{cards.length} cards</div>
      )}
    </div>
  );
}