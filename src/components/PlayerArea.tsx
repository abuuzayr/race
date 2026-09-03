import { CardBack } from './CardBack';

interface PlayerAreaProps {
  name: string;
  cardCount: number;
  isCurrentPlayer: boolean;
  isHuman?: boolean;
  className?: string;
}

export function PlayerArea({
  name,
  cardCount,
  isCurrentPlayer,
  isHuman = false,
  className = '',
}: PlayerAreaProps) {
  return (
    <div
      className={`player-area ${isCurrentPlayer ? 'current' : ''} ${isHuman ? 'human' : ''} ${className}`}
      aria-label={`${name}: ${cardCount} cards${isCurrentPlayer ? ' (your turn)' : ''}`}
    >
      <div className="player-name">
        {name}
        {isCurrentPlayer && <span className="turn-indicator" aria-live="polite">▶</span>}
      </div>
      <div className="player-cards" role="img" aria-label={`${cardCount} cards`}>
        {Array.from({ length: Math.min(cardCount, 7) }, (_, i) => (
          <CardBack key={i} className="opponent-card" />
        ))}
      </div>
      <div className="player-card-count">{cardCount} cards</div>
    </div>
  );
}