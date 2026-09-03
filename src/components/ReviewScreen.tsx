import type { ReviewItem } from '../training/review';

interface ReviewScreenProps {
  items: ReviewItem[];
  onClose: () => void;
  className?: string;
}

export function ReviewScreen({
  items,
  onClose,
  className = '',
}: ReviewScreenProps) {
  if (items.length === 0) {
    return (
      <div className={`review-screen ${className}`} role="dialog" aria-modal="true">
        <h2>Review Your Decisions</h2>
        <p className="no-decisions">No significant decisions to review this game.</p>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className={`review-screen ${className}`} role="dialog" aria-modal="true">
      <div className="review-header">
        <h2>Review Your Decisions</h2>
        <button className="btn-close" onClick={onClose} aria-label="Close review">×</button>
      </div>
      <div className="review-list">
        {items.map((item, index) => (
          <div key={index} className={`review-item ${item.type}`}>
            <div className="review-turn">Turn {item.turn}</div>
            <div className="review-message">{item.message}</div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={onClose}>Close</button>
    </div>
  );
}