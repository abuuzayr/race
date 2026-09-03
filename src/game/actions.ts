import type { GameState, GameAction, PlayerId } from './state';
import type { RaceRules } from './rules';
import { createDeck, shuffleDeck } from './cards';
import { detectWinningHand, hasWinningHand } from './engine';
import { malaysiaStandard } from './rules';

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return startGame(state, action.rules);
    case 'DRAW_STOCK':
      return drawStock(state, action.playerId);
    case 'MAKAN':
      return makan(state, action.playerId);
    case 'DISCARD':
      return discard(state, action.playerId, action.cardId);
    case 'DECLARE':
      return declare(state, action.playerId);
    default:
      return state;
  }
}

function startGame(state: GameState, ruleOverrides?: Partial<RaceRules>): GameState {
  const rules = { ...malaysiaStandard, ...ruleOverrides };
  const deck = shuffleDeck(createDeck());
  const playerCount = rules.playerCount;
  const players: GameState['players'] = [];

  for (let i = 0; i < playerCount; i++) {
    players.push({
      id: `player_${i}`,
      name: i === 0 ? 'You' : `Bot ${i}`,
      cards: [],
      isHuman: i === 0,
      isBot: i > 0,
    });
  }

  const startingPlayerIndex = Math.floor(Math.random() * playerCount);

  let deckIndex = 0;
  for (let i = 0; i < playerCount; i++) {
    const playerIndex = (startingPlayerIndex + i) % playerCount;
    const handSize = i === 0 ? rules.startingHandSize : rules.handSize;
    players[playerIndex].cards = deck.slice(deckIndex, deckIndex + handSize);
    deckIndex += handSize;
  }

  const stock = deck.slice(deckIndex);

  return {
    ...state,
    rules,
    players,
    currentPlayerIndex: startingPlayerIndex,
    stock,
    discardPile: [],
    phase: 'playing',
    winner: null,
    winningHand: null,
    lastAction: { type: 'START_GAME' },
    turnCount: 0,
    startingPlayerIndex,
  };
}

function drawStock(state: GameState, playerId: PlayerId): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;
  if (playerIndex !== state.currentPlayerIndex) return state;
  if (state.phase !== 'playing' && state.phase !== 'kopek') return state;
  if (state.stock.length === 0) return state;

  const player = state.players[playerIndex];
  if (player.cards.length !== 7) return state;

  const drawnCard = state.stock[0];
  const newStock = state.stock.slice(1);

  return {
    ...state,
    players: state.players.map((p, i) =>
      i === playerIndex ? { ...p, cards: [...p.cards, drawnCard] } : p
    ),
    stock: newStock,
    lastAction: { type: 'DRAW_STOCK', playerId },
  };
}

function makan(state: GameState, playerId: PlayerId): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;
  if (playerIndex !== state.currentPlayerIndex) return state;
  if (state.phase !== 'playing' && state.phase !== 'kopek') return state;
  if (state.discardPile.length === 0) return state;

  const player = state.players[playerIndex];
  if (player.cards.length !== 7) return state;

  const takenCard = state.discardPile[state.discardPile.length - 1];
  const newDiscardPile = state.discardPile.slice(0, -1);

  return {
    ...state,
    players: state.players.map((p, i) =>
      i === playerIndex ? { ...p, cards: [...p.cards, takenCard] } : p
    ),
    discardPile: newDiscardPile,
    lastAction: { type: 'MAKAN', playerId },
  };
}

function discard(state: GameState, playerId: PlayerId, cardId: string): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;
  if (playerIndex !== state.currentPlayerIndex) return state;
  if (state.phase !== 'playing' && state.phase !== 'kopek') return state;

  const player = state.players[playerIndex];
  if (player.cards.length !== 8) return state;

  const cardIndex = player.cards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return state;

  const [discardedCard] = player.cards.splice(cardIndex, 1);
  const newCards = [...player.cards];

  const newPlayers = state.players.map((p, i) =>
    i === playerIndex ? { ...p, cards: newCards } : p
  );

  const newDiscardPile = [...state.discardPile, discardedCard];

  let newPhase: GameState['phase'] = state.phase;
  let newWinner = state.winner;
  let newWinningHand = state.winningHand;

  if (hasWinningHand(newCards, state.rules)) {
    const winningHand = detectWinningHand(newCards, state.rules, 'kadang');
    if (winningHand) {
      newPhase = 'finished';
      newWinner = playerId;
      newWinningHand = winningHand;
    }
  }

  const nextPlayerIndex = (playerIndex + 1) % state.players.length;
  const isKopek = state.phase === 'playing' && newStockCount(state.stock) <= 4;

  if (newPhase !== 'finished' && isKopek) {
    newPhase = 'kopek';
  }

  return {
    ...state,
    players: newPlayers,
    discardPile: newDiscardPile,
    currentPlayerIndex: newPhase === 'finished' ? playerIndex : nextPlayerIndex,
    phase: newPhase,
    winner: newWinner,
    winningHand: newWinningHand,
    turnCount: state.turnCount + 1,
    lastAction: { type: 'DISCARD', playerId, cardId },
  };
}

function declare(state: GameState, playerId: PlayerId): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;
  if (playerIndex !== state.currentPlayerIndex) return state;

  const player = state.players[playerIndex];
  if (player.cards.length !== 7) return state;

  if (!hasWinningHand(player.cards, state.rules)) return state;

  const winningHand = detectWinningHand(player.cards, state.rules, 'kadang');
  if (!winningHand) return state;

  return {
    ...state,
    phase: 'finished',
    winner: playerId,
    winningHand,
    lastAction: { type: 'DECLARE', playerId },
  };
}

function newStockCount(stock: GameState['stock']): number {
  return stock.length;
}