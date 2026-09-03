import { describe, it, expect, beforeEach } from 'vitest';
import { createCard } from '../game/cards';
import { malaysiaStandard } from '../game/rules';
import { applyAction } from '../game/actions';
import { createInitialState, getViewState } from '../game/state';
import type { GameState, GameAction } from '../game/state';

describe('game state machine', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = createInitialState(malaysiaStandard);
  });

  describe('START_GAME', () => {
    it('deals correct number of cards', () => {
      const action: GameAction = { type: 'START_GAME' };
      const state = applyAction(initialState, action);

      expect(state.players.length).toBe(4);
      const startingPlayer = state.players[state.currentPlayerIndex];
      expect(startingPlayer.cards.length).toBe(8); // starting player
      for (const player of state.players) {
        if (player.id !== startingPlayer.id) {
          expect(player.cards.length).toBe(7);
        }
      }
    });

    it('starting player has 8 cards then discards to 7', () => {
      const action: GameAction = { type: 'START_GAME' };
      const state = applyAction(initialState, action);

      const startingPlayer = state.players[state.currentPlayerIndex];
      expect(startingPlayer.cards.length).toBe(8);
    });

    it('stock has remaining cards', () => {
      const action: GameAction = { type: 'START_GAME' };
      const state = applyAction(initialState, action);

      const totalDealt = state.players.reduce((sum, p) => sum + p.cards.length, 0);
      expect(state.stock.length).toBe(52 - totalDealt);
    });

    it('discard pile is empty initially', () => {
      const action: GameAction = { type: 'START_GAME' };
      const state = applyAction(initialState, action);
      expect(state.discardPile.length).toBe(0);
    });

    it('phase is playing', () => {
      const action: GameAction = { type: 'START_GAME' };
      const state = applyAction(initialState, action);
      expect(state.phase).toBe('playing');
    });
  });

  describe('DRAW_STOCK', () => {
    let gameState: GameState;

    beforeEach(() => {
      const action: GameAction = { type: 'START_GAME' };
      gameState = applyAction(initialState, action);

      // Starting player must discard first, so advance to next player
      const startingPlayer = gameState.players[gameState.currentPlayerIndex];
      const discardAction: GameAction = {
        type: 'DISCARD',
        playerId: startingPlayer.id,
        cardId: startingPlayer.cards[0].id,
      };
      gameState = applyAction(gameState, discardAction);
    });

    it('draws top card from stock', () => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const stockTop = gameState.stock[0];

      const action: GameAction = { type: 'DRAW_STOCK', playerId: currentPlayer.id };
      const state = applyAction(gameState, action);

      const player = state.players.find(p => p.id === currentPlayer.id)!;
      expect(player.cards.length).toBe(8);
      expect(player.cards.some(c => c.id === stockTop.id)).toBe(true);
      expect(state.stock.length).toBe(gameState.stock.length - 1);
    });

    it('cannot draw twice', () => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      const action1: GameAction = { type: 'DRAW_STOCK', playerId: currentPlayer.id };
      const state1 = applyAction(gameState, action1);

      const action2: GameAction = { type: 'DRAW_STOCK', playerId: currentPlayer.id };
      const state2 = applyAction(state1, action2);

      expect(state2.players.find(p => p.id === currentPlayer.id)!.cards.length).toBe(8);
    });

    it('cannot draw when not turn', () => {
      const nextPlayer = gameState.players[(gameState.currentPlayerIndex + 1) % 4];

      const action: GameAction = { type: 'DRAW_STOCK', playerId: nextPlayer.id };
      const state = applyAction(gameState, action);

      expect(state.players.find(p => p.id === nextPlayer.id)!.cards.length).toBe(7);
    });

    it('cannot draw with empty stock', () => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const emptyStockState = { ...gameState, stock: [] };

      const action: GameAction = { type: 'DRAW_STOCK', playerId: currentPlayer.id };
      const state = applyAction(emptyStockState, action);

      expect(state.players.find(p => p.id === currentPlayer.id)!.cards.length).toBe(7);
    });
  });

  describe('MAKAN', () => {
    let gameState: GameState;

    beforeEach(() => {
      const action: GameAction = { type: 'START_GAME' };
      gameState = applyAction(initialState, action);

      // First player discards to create a discard pile
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const discardAction: GameAction = {
        type: 'DISCARD',
        playerId: currentPlayer.id,
        cardId: currentPlayer.cards[0].id,
      };
      gameState = applyAction(gameState, discardAction);
    });

    it('takes top discard', () => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];

      const action: GameAction = { type: 'MAKAN', playerId: currentPlayer.id };
      const state = applyAction(gameState, action);

      const player = state.players.find(p => p.id === currentPlayer.id)!;
      expect(player.cards.length).toBe(8);
      expect(player.cards.some(c => c.id === topDiscard.id)).toBe(true);
      expect(state.discardPile.length).toBe(gameState.discardPile.length - 1);
    });

    it('cannot makan after drawing', () => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      const drawAction: GameAction = { type: 'DRAW_STOCK', playerId: currentPlayer.id };
      const afterDraw = applyAction(gameState, drawAction);

      const makanAction: GameAction = { type: 'MAKAN', playerId: currentPlayer.id };
      const state = applyAction(afterDraw, makanAction);

      expect(state.players.find(p => p.id === currentPlayer.id)!.cards.length).toBe(8);
    });

    it('cannot makan empty discard', () => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const emptyDiscardState = { ...gameState, discardPile: [] };

      const action: GameAction = { type: 'MAKAN', playerId: currentPlayer.id };
      const state = applyAction(emptyDiscardState, action);

      expect(state.players.find(p => p.id === currentPlayer.id)!.cards.length).toBe(7);
    });
  });

  describe('DISCARD', () => {
    let gameState: GameState;

    beforeEach(() => {
      const action: GameAction = { type: 'START_GAME' };
      gameState = applyAction(initialState, action);

      // Current player draws to have 8 cards
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const drawAction: GameAction = { type: 'DRAW_STOCK', playerId: currentPlayer.id };
      gameState = applyAction(gameState, drawAction);
    });

    it('discards selected card', () => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const cardToDiscard = currentPlayer.cards[0].id;

      const action: GameAction = { type: 'DISCARD', playerId: currentPlayer.id, cardId: cardToDiscard };
      const state = applyAction(gameState, action);

      const player = state.players.find(p => p.id === currentPlayer.id)!;
      expect(player.cards.length).toBe(7);
      expect(player.cards.some(c => c.id === cardToDiscard)).toBe(false);
      expect(state.discardPile[state.discardPile.length - 1].id).toBe(cardToDiscard);
    });

    it('cannot discard before acquiring card', () => {
      const nextPlayer = gameState.players[(gameState.currentPlayerIndex + 1) % 4];
      const cardToDiscard = nextPlayer.cards[0].id;

      const action: GameAction = { type: 'DISCARD', playerId: nextPlayer.id, cardId: cardToDiscard };
      const state = applyAction(gameState, action);

      expect(state.players.find(p => p.id === nextPlayer.id)!.cards.length).toBe(7);
    });

    it('advances turn after discard', () => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const cardToDiscard = currentPlayer.cards[0].id;

      const action: GameAction = { type: 'DISCARD', playerId: currentPlayer.id, cardId: cardToDiscard };
      const state = applyAction(gameState, action);

      expect(state.currentPlayerIndex).toBe((gameState.currentPlayerIndex + 1) % 4);
      expect(state.turnCount).toBe(gameState.turnCount + 1);
    });

    it('detects kadang on discard', () => {
      // Create a winning hand manually
      const winningCards = [
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('spades', '6'),
        createCard('spades', '7'),
        createCard('hearts', '9'),
        createCard('diamonds', '9'),
        createCard('clubs', '9'),
        createCard('hearts', '2'), // extra card to discard
      ];

      const player = gameState.players[gameState.currentPlayerIndex];
      const stateWithWinningHand = {
        ...gameState,
        players: gameState.players.map(p =>
          p.id === player.id ? { ...p, cards: winningCards } : p
        ),
      };

      const action: GameAction = {
        type: 'DISCARD',
        playerId: player.id,
        cardId: '2_of_hearts',
      };
      const state = applyAction(stateWithWinningHand, action);

      expect(state.phase).toBe('finished');
      expect(state.winner).toBe(player.id);
      expect(state.winningHand).not.toBeNull();
    });
  });

  describe('DECLARE', () => {
    it('declares win with valid 7-card hand', () => {
      const winningCards = [
        createCard('spades', '4'),
        createCard('spades', '5'),
        createCard('spades', '6'),
        createCard('spades', '7'),
        createCard('hearts', '9'),
        createCard('diamonds', '9'),
        createCard('clubs', '9'),
      ];

      let state = applyAction(initialState, { type: 'START_GAME' });
      const player = state.players[state.currentPlayerIndex];

      state = {
        ...state,
        players: state.players.map(p =>
          p.id === player.id ? { ...p, cards: winningCards } : p
        ),
      };

      const action: GameAction = { type: 'DECLARE', playerId: player.id };
      const result = applyAction(state, action);

      expect(result.phase).toBe('finished');
      expect(result.winner).toBe(player.id);
      expect(result.winningHand).not.toBeNull();
    });

    it('rejects declare with invalid hand', () => {
      let state = applyAction(initialState, { type: 'START_GAME' });
      const player = state.players[state.currentPlayerIndex];

      const action: GameAction = { type: 'DECLARE', playerId: player.id };
      const result = applyAction(state, action);

      expect(result.phase).toBe('playing');
      expect(result.winner).toBeNull();
    });
  });

  describe('getViewState', () => {
    it('returns correct view for human player', () => {
      let state = applyAction(initialState, { type: 'START_GAME' });
      const human = state.players[0];
      const view = getViewState(state, human.id);

      expect(view.player.id).toBe(human.id);
      expect(view.opponents.length).toBe(3);
      expect(view.currentPlayerId).toBe(state.players[state.currentPlayerIndex].id);
    });
  });
});