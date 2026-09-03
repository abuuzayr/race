interface HowToPlayScreenProps {
  onClose: () => void;
  className?: string;
}

export function HowToPlayScreen({
  onClose,
  className = '',
}: HowToPlayScreenProps) {
  return (
    <div className={`how-to-play-screen ${className}`} role="dialog" aria-modal="true">
      <div className="how-to-play-header">
        <h2>How to Play Race</h2>
        <button className="btn-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="how-to-play-content">
        <section>
          <h3>Objective</h3>
          <p>Arrange your 7 cards into exactly one 4-card combination + one 3-card combination.</p>
        </section>

        <section>
          <h3>Valid Combinations</h3>
          <div className="combination-types">
            <div className="combo-type">
              <h4>Run</h4>
              <p>3 or 4 consecutive cards of the <strong>same suit</strong>.</p>
              <div className="example">4♠ 5♠ 6♠</div>
              <div className="example">7♥ 8♥ 9♥ 10♥</div>
            </div>
            <div className="combo-type">
              <h4>Set</h4>
              <p>3 or 4 cards of the <strong>same rank</strong>.</p>
              <div className="example">7♠ 7♥ 7♦</div>
              <div className="example">Q♠ Q♥ Q♦ Q♣</div>
            </div>
          </div>
        </section>

        <section>
          <h3>Winning Hands</h3>
          <ul>
            <li>4-card Run + 3-card Run</li>
            <li>4-card Run + 3-card Set</li>
            <li>4-card Set + 3-card Run</li>
            <li>4-card Set + 3-card Set</li>
          </ul>
        </section>

        <section>
          <h3>Gameplay</h3>
          <ol>
            <li>Starting player gets 8 cards, others get 7</li>
            <li>Starting player discards one card</li>
            <li>On your turn: <strong>MAKAN</strong> (take previous discard) or <strong>DRAW</strong> (from stock)</li>
            <li>You now have 8 cards — must discard one</li>
            <li>Play proceeds clockwise</li>
          </ol>
        </section>

        <section>
          <h3>Special Terms</h3>
          <dl>
            <dt>KADANG</dt>
            <dd>Complete a winning hand normally</dd>
            <dt>SAMPAI</dt>
            <dd>Win by taking the previous player's discard (Makan)</dd>
            <dt>KOPEK</dt>
            <dd>Final round when stock has 4 cards left</dd>
            <dt>KECIK MATA</dt>
            <dd>Lowest points wins if nobody completes hand</dd>
          </dl>
        </section>

        <section>
          <h3>Card Values (Kecik Mata)</h3>
          <p>A=1, 2-10=face value, J/Q/K=10</p>
        </section>
      </div>
      <button className="btn btn-primary" onClick={onClose}>Got It</button>
    </div>
  );
}