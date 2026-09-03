import { useEffect, useRef, useState } from 'react';
import { LocalGameTransport } from '../transport/LocalGameTransport';
import type { GameViewState } from '../game/state';
import type { Card } from '../game/cards';
import {
  Hand,
  DiscardPile,
  StockPile,
  ActionButtons,
  PlayerArea,
  GameResult,
  ReviewScreen,
} from '../components';
import { recordDecision, saveDecisions } from '../training/decisions';
import { generateReviewItems } from '../training/review';
import { loadPreferences, loadStats, saveStats, recordGameResult } from '../storage';
import type { ReviewItem, DecisionRecord } from '../training/review';

interface GameScreenProps {
  onHome: () => void;
}

export function GameScreen({ onHome }: GameScreenProps) {
  const transportRef = useRef<LocalGameTransport | null>(null);
  const [viewState, setViewState] = useState<GameViewState | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [turnNumber, setTurnNumber] = useState(1);
  const [makanCount, setMakanCount] = useState(0);
  const [drawCount, setDrawCount] = useState(0);
  const [optimalDiscards, setOptimalDiscards] = useState(0);
  const [totalDiscards, setTotalDiscards] = useState(0);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    const prefs = loadPreferences();
    const transport = new LocalGameTransport(prefs.botDifficulty);
    transportRef.current = transport;

    const unsubscribe = transport.subscribe((state) => {
      setViewState(state);
    });

    setViewState(transport.getState());

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDraw = () => {
    if (!viewState || !transportRef.current) return;
    const player = viewState.player;
    const visibleCards = viewState.discardTop ? [viewState.discardTop] : [];

    const decision = recordDecision(
      turnNumber,
      'draw',
      player.cards,
      visibleCards,
      { type: 'DRAW_STOCK', playerId: player.id },
      viewState.rules,
      undefined,
      undefined
    );

    transportRef.current.dispatch({ type: 'DRAW_STOCK', playerId: player.id });
    setDrawCount(c => c + 1);
    setDecisions(d => [...d, decision]);
  };

  const handleMakan = () => {
    if (!viewState || !transportRef.current) return;
    const player = viewState.player;
    const acquiredCard = viewState.discardTop!;
    const visibleCards = [acquiredCard];

    const decision = recordDecision(
      turnNumber,
      'draw',
      player.cards,
      visibleCards,
      { type: 'MAKAN', playerId: player.id },
      viewState.rules,
      acquiredCard,
      undefined
    );

    transportRef.current.dispatch({ type: 'MAKAN', playerId: player.id });
    setMakanCount(c => c + 1);
    setDecisions(d => [...d, decision]);
  };

  const handleCardClick = (card: Card) => {
    if (!viewState) return;
    if (viewState.mustDiscard) {
      setSelectedCard(card);
    }
  };

  const handleDiscard = () => {
    if (!viewState || !transportRef.current || !selectedCard) return;
    const player = viewState.player;
    const visibleCards = viewState.discardTop ? [viewState.discardTop] : [];

    const decision = recordDecision(
      turnNumber,
      'discard',
      player.cards,
      visibleCards,
      { type: 'DISCARD', playerId: player.id, cardId: selectedCard.id },
      viewState.rules,
      undefined,
      selectedCard
    );

    const wasOptimal = decision.wasOptimal;
    if (wasOptimal) setOptimalDiscards(c => c + 1);
    setTotalDiscards(c => c + 1);

    transportRef.current.dispatch({ type: 'DISCARD', playerId: player.id, cardId: selectedCard.id });
    setSelectedCard(null);
    setTurnNumber(t => t + 1);
    setDecisions(d => [...d, decision]);
  };

  useEffect(() => {
    if (viewState?.phase === 'finished' && !showResult) {
      setShowResult(true);

      const stats = loadStats();
      const won = viewState.winner === 'player_0' || viewState.winner === 'You';
      const winReason = viewState.winningHand?.reason || null;

      const newStats = recordGameResult(
        stats,
        won,
        winReason,
        turnNumber,
        makanCount,
        drawCount,
        optimalDiscards,
        totalDiscards
      );
      saveStats(newStats);

      const review = generateReviewItems(decisions);
      setReviewItems(review);
      saveDecisions(decisions);
    }
  }, [viewState?.phase, showResult]);

  const handlePlayAgain = () => {
    if (!transportRef.current) return;
    transportRef.current.dispatch({ type: 'START_GAME' });
    setShowResult(false);
    setShowReview(false);
    setDecisions([]);
    setTurnNumber(1);
    setMakanCount(0);
    setDrawCount(0);
    setOptimalDiscards(0);
    setTotalDiscards(0);
    setSelectedCard(null);
    setReviewItems([]);
  };

  const handleReview = () => {
    setShowReview(true);
  };

  if (!viewState) return <div className="loading">Loading game...</div>;

  return (
    <div className="game-screen">
      <header className="game-header">
        <h1>RACE</h1>
        <button className="btn-home" onClick={onHome}>Home</button>
      </header>

      <main className="game-table">
        <div className="opponents-top">
          <PlayerArea
            name="Bot 1"
            cardCount={viewState.opponents[0]?.cards.length || 7}
            isCurrentPlayer={viewState.currentPlayerId === viewState.opponents[0]?.id}
          />
          <PlayerArea
            name="Bot 2"
            cardCount={viewState.opponents[1]?.cards.length || 7}
            isCurrentPlayer={viewState.currentPlayerId === viewState.opponents[1]?.id}
          />
          <PlayerArea
            name="Bot 3"
            cardCount={viewState.opponents[2]?.cards.length || 7}
            isCurrentPlayer={viewState.currentPlayerId === viewState.opponents[2]?.id}
          />
        </div>

        <div className="center-area">
          <DiscardPile cards={viewState.discardTop ? [viewState.discardTop] : []} />
          <StockPile
            count={viewState.stockCount}
            onClick={handleDraw}
            enabled={viewState.canDraw}
          />
        </div>

        <div className="player-area-bottom">
          <Hand
            cards={viewState.player.cards}
            onCardClick={handleCardClick}
            selectedCard={selectedCard}
            canSelect={viewState.mustDiscard}
            sortBy={loadPreferences().sortPreference}
          />
          <ActionButtons
            canDraw={viewState.canDraw}
            canMakan={viewState.canMakan}
            mustDiscard={viewState.mustDiscard}
            onDraw={handleDraw}
            onMakan={handleMakan}
            onDiscard={handleDiscard}
          />
        </div>
      </main>

      {showResult && viewState.winner && viewState.winningHand && (
        <GameResult
          winner={viewState.winner === 'player_0' ? 'You' : viewState.winner}
          winningHand={viewState.winningHand}
          winReason={viewState.winningHand.reason}
          onPlayAgain={handlePlayAgain}
          onReview={handleReview}
          onHome={onHome}
        />
      )}

      {showReview && (
        <ReviewScreen
          items={reviewItems}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  );
}