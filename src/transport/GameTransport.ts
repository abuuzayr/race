import type { GameViewState, GameAction, PlayerId } from '../game/state';

export type StateListener = (state: GameViewState) => void;
export type Unsubscribe = () => void;

export interface GameTransport {
  getState(): GameViewState;
  dispatch(action: GameAction): void;
  subscribe(listener: StateListener): Unsubscribe;
  getPlayerId(): PlayerId;
}