import type { GameState, GameAction, GameViewState, PlayerId } from '../game/state';
import type { GameTransport } from './GameTransport';
import { createInitialState } from '../game/state';
import { malaysiaStandard } from '../game/rules';
import { applyAction } from '../game/actions';
import { createBot } from '../ai/bot';

export class LocalGameTransport implements GameTransport {
  private state: GameState;
  private listeners: Set<StateListener> = new Set();
  private playerId: PlayerId;
  private bots: Map<PlayerId, (state: GameState) => { action: GameAction; reasoning: string }> = new Map();
  private isProcessing: boolean = false;

  constructor(difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
    this.state = createInitialState(malaysiaStandard);
    this.playerId = 'player_0';

    for (const player of this.state.players) {
      if (player.isBot) {
        this.bots.set(player.id, createBot(difficulty, player.id));
      }
    }

    this.startGame();
  }

  private startGame() {
    this.dispatch({ type: 'START_GAME' });
  }

  getState(): GameViewState {
    return this.getViewState(this.playerId);
  }

  getPlayerId(): PlayerId {
    return this.playerId;
  }

  dispatch(action: GameAction): void {
    this.state = applyAction(this.state, action);
    this.notifyListeners();

    if (!this.isProcessing && this.state.phase === 'playing' || this.state.phase === 'kopek') {
      this.processBotTurns();
    }
  }

  private async processBotTurns() {
    this.isProcessing = true;

    while (this.state.phase === 'playing' || this.state.phase === 'kopek') {
      const currentPlayer = this.state.players[this.state.currentPlayerIndex];

      if (currentPlayer.isBot) {
        const bot = this.bots.get(currentPlayer.id);
        if (bot) {
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
          const decision = bot(this.state);
          this.state = applyAction(this.state, decision.action);
          this.notifyListeners();
        } else {
          break;
        }
      } else {
        break;
      }
    }

    this.isProcessing = false;
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const viewState = this.getViewState(this.playerId);
    for (const listener of this.listeners) {
      listener(viewState);
    }
  }

  private getViewState(viewerId: PlayerId): GameViewState {
    const player = this.state.players.find(p => p.id === viewerId)!;
    const opponents = this.state.players.filter(p => p.id !== viewerId);
    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    const isCurrentPlayer = currentPlayer.id === viewerId;

    return {
      player,
      opponents,
      currentPlayerId: currentPlayer.id,
      discardTop: this.state.discardPile[this.state.discardPile.length - 1] || null,
      stockCount: this.state.stock.length,
      phase: this.state.phase,
      canDraw: isCurrentPlayer && (this.state.phase === 'playing' || this.state.phase === 'kopek') && player.cards.length === 7,
      canMakan: isCurrentPlayer && (this.state.phase === 'playing' || this.state.phase === 'kopek') && this.state.discardPile.length > 0 && player.cards.length === 7,
      mustDiscard: isCurrentPlayer && player.cards.length === 8,
      winner: this.state.winner,
      winningHand: this.state.winningHand,
      turnCount: this.state.turnCount,
      rules: this.state.rules,
    };
  }
}

type StateListener = (state: GameViewState) => void;