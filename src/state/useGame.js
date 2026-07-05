import { useContext } from 'react';
import { GameContext } from './GameContext.js';

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de un GameProvider');
  return ctx;
}
