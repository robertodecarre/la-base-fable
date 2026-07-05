import { useReducer } from 'react';
import { gameReducer, estadoInicial } from '../engine/game.js';
import { GameContext } from './GameContext.js';

export function GameProvider({ children }) {
  const [estado, dispatch] = useReducer(gameReducer, undefined, estadoInicial);
  return (
    <GameContext.Provider value={{ estado, dispatch }}>{children}</GameContext.Provider>
  );
}
