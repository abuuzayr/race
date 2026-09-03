interface ActionButtonsProps {
  canDraw: boolean;
  canMakan: boolean;
  mustDiscard: boolean;
  onDraw: () => void;
  onMakan: () => void;
  onDiscard: () => void;
  className?: string;
}

export function ActionButtons({
  canDraw,
  canMakan,
  mustDiscard,
  onDraw,
  onMakan,
  onDiscard,
  className = '',
}: ActionButtonsProps) {
  if (mustDiscard) {
    return (
      <div className={`action-buttons discard-mode ${className}`}>
        <button
          className="btn btn-primary btn-discard"
          onClick={onDiscard}
          disabled={!mustDiscard}
        >
          DISCARD
        </button>
        <p className="action-hint">Tap a card to select, then press DISCARD</p>
      </div>
    );
  }

  return (
    <div className={`action-buttons ${className}`}>
      <div className="action-row">
        {canMakan && (
          <button className="btn btn-makan" onClick={onMakan} disabled={!canMakan}>
            MAKAN
          </button>
        )}
        {canDraw && (
          <button className="btn btn-draw" onClick={onDraw} disabled={!canDraw}>
            DRAW
          </button>
        )}
      </div>
      {(!canDraw && !canMakan) && (
        <p className="action-hint">Waiting for your turn...</p>
      )}
    </div>
  );
}