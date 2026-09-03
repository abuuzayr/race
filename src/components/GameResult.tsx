import type { WinningHand, WinReason } from '../game/engine';
import { CardComponent } from './Card';

interface GameResultProps {
  winner: string;
  winningHand: WinningHand | null;
  winReason: WinReason;
  onPlayAgain: () => void;
  onReview: () => void;
  onHome: () => void;
  className?: string;
}

export function GameResult({
  winner,
  winningHand,
  winReason,
  onPlayAgain,
  onReview,
  onHome,
  className = '',
}: GameResultProps) {
  return (
    <div className={`game-result ${className}`} role="dialog" aria-modal="true" aria-labelledby="result-title">
      <h1 id="result-title" className="result-title">
        {winReason === 'sampai' ? 'SAMPAI!' : winReason === 'kadang' ? 'KADANG!' : 'KECIK MATA'}
      </h1>
      <p className="winner-text">{winner} wins!</p>

      {winningHand && (
        <div className="winning-melds">
          <div className="meld-group">
            <div className="meld-label">4-card meld ({winningHand.fourCardMeld.type})</div>
            <div className="meld-cards">
              {winningHand.fourCardMeld.cards.map((card) => (
                <CardComponent key={card.id} card={card} faceUp={true} className="result-card" />
              ))}
            </div>
          </div>
          <div className="meld-group">
            <div className="meld-label">3-card meld ({winningHand.threeCardMeld.type})</div>
            <div className="meld-cards">
              {winningHand.threeCardMeld.cards.map((card) => (
                <CardComponent key={card.id} card={card} faceUp={true} className="result-card" />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onPlayAgain}>
          Play Again
        </button>
        <button className="btn btn-secondary" onClick={onReview}>
          Review My Decisions
        </button>
        <button className="btn btn-secondary" onClick={onHome}>
          Home
        </button>
      </div>
    </div>
  );
}