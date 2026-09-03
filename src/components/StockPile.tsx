import { useState } from 'react';
import { CardBack } from './CardBack';

interface StockPileProps {
  count: number;
  onClick?: () => void;
  enabled?: boolean;
  className?: string;
}

export function StockPile({ count, onClick, enabled = true, className = '' }: StockPileProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`stock-pile ${enabled ? 'enabled' : 'disabled'} ${hovered ? 'hovered' : ''} ${className}`}
      onClick={enabled ? onClick : undefined}
      onMouseEnter={() => enabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={enabled ? 0 : -1}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && enabled) { e.preventDefault(); onClick?.(); } }}
      aria-label={`Stock pile: ${count} cards remaining`}
    >
      <CardBack />
      {count > 1 && <CardBack className="stock-second" />}
      {count > 2 && <CardBack className="stock-third" />}
      <div className="stock-count">{count}</div>
      <div className="stock-label">STOCK</div>
    </div>
  );
}