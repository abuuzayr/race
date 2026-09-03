import type { Card } from './cards';
import type { RaceRules } from './rules';
import type { WinningHand } from './engine';

export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  cards: Card[];
  isHuman: boolean;
  isBot: boolean;
}

export type GamePhase = 'dealing' | 'playing' | 'kopek' | 'finished';

export interface GameState {
  rules: RaceRules;
  players: Player[];
  currentPlayerIndex: number;
  stock: Card[];
  discardPile: Card[];
  phase: GamePhase;
  winner: PlayerId | null;
  winningHand: WinningHand | null;
  lastAction: GameAction | null;
  turnCount: number;
  startingPlayerIndex: number;
}

export type GameAction =
  | { type: 'DRAW_STOCK'; playerId: PlayerId }
  | { type: 'MAKAN'; playerId: PlayerId }
  | { type: 'DISCARD'; playerId: PlayerId; cardId: string }
  | { type: 'DECLARE'; playerId: PlayerId }
  | { type: 'START_GAME'; rules?: Partial<RaceRules> };

export interface GameViewState {
  player: Player;
  opponents: Player[];
  currentPlayerId: PlayerId;
  discardTop: Card | null;
  stockCount: number;
  phase: GamePhase;
  canDraw: boolean;
  canMakan: boolean;
  mustDiscard: boolean;
  winner: PlayerId | null;
  winningHand: WinningHand | null;
  turnCount: number;
  rules: RaceRules;
}

export function createInitialState(rules: RaceRules): GameState {
  return {
    rules,
    players: [],
    currentPlayerIndex: 0,
    stock: [],
    discardPile: [],
    phase: 'dealing',
    winner: null,
    winningHand: null,
    lastAction: null,
    turnCount: 0,
    startingPlayerIndex: 0,
  };
}

export function getViewState(state: GameState, viewerId: PlayerId): GameViewState {
  const player = state.players.find(p => p.id === viewerId)!;
  const opponents = state.players.filter(p => p.id !== viewerId);
  const currentPlayer = state.players[state.currentPlayerIndex];
  const isCurrentPlayer = currentPlayer.id === viewerId;
  const isActivePhase = state.phase === 'playing' || state.phase === 'kopek';

  return {
    player,
    opponents,
    currentPlayerId: currentPlayer.id,
    discardTop: state.discardPile[state.discardPile.length - 1] || null,
    stockCount: state.stock.length,
    phase: state.phase,
    canDraw: isCurrentPlayer && isActivePhase && player.cards.length === 7 && state.stock.length > 0,
    canMakan: isCurrentPlayer && isActivePhase && player.cards.length === 7 && state.discardPile.length > 0,
    mustDiscard: isCurrentPlayer && player.cards.length === 8,
    winner: state.winner,
    winningHand: state.winningHand,
    turnCount: state.turnCount,
    rules: state.rules,
  };
}