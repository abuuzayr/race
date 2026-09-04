import type { Card } from '../game/cards';

export type { Card };

interface CardProps {
  card: Card;
  faceUp?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const suitSymbols: Record<Card['suit'], string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const suitColors: Record<Card['suit'], string> = {
  spades: '#000',
  hearts: '#c00',
  diamonds: '#c00',
  clubs: '#000',
};

export function CardComponent({
  card,
  faceUp = true,
  selected = false,
  onClick,
  className = '',
}: CardProps) {
  const suitSymbol = suitSymbols[card.suit];
  const suitColor = suitColors[card.suit];
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  if (!faceUp) {
    return (
      <div
        className={`card card-back ${className}`}
        onClick={onClick}
        style={{
          transform: selected ? 'translateY(-8px)' : 'none',
          transition: 'transform 0.15s ease',
        }}
      >
        <div className="card-back-pattern">RACE</div>
      </div>
    );
  }

  return (
    <div
      className={`card ${isRed ? 'red' : 'black'} ${selected ? 'selected' : ''} ${className}`}
      onClick={onClick}
      style={{
        transform: selected ? 'translateY(-8px)' : 'none',
        transition: 'transform 0.15s ease',
        borderColor: selected ? '#ffd700' : 'var(--border)',
        boxShadow: selected ? '0 8px 24px rgba(255, 215, 0, 0.4)' : '0 2px 8px var(--shadow)',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
    >
      <div className="card-inner">
        <div className="card-corner">
          <span className="card-rank" style={{ color: suitColor }}>{card.rank}</span>
          <span className="card-suit" style={{ color: suitColor }}>{suitSymbol}</span>
        </div>
        <div className="card-center" style={{ color: suitColor }}>
          {suitSymbol}
        </div>
        <div className="card-corner flipped">
          <span className="card-suit" style={{ color: suitColor }}>{suitSymbol}</span>
          <span className="card-rank" style={{ color: suitColor }}>{card.rank}</span>
        </div>
      </div>
    </div>
  );
}