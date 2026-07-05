import { GameProvider } from './state/GameProvider.jsx';
import { useGame } from './state/useGame.js';
import ConfigScreen from './ui/screens/ConfigScreen.jsx';
import SorteoScreen from './ui/screens/SorteoScreen.jsx';
import GameScreen from './ui/screens/GameScreen.jsx';
import GameOverScreen from './ui/screens/GameOverScreen.jsx';

function Router() {
  const { estado } = useGame();
  switch (estado.fase) {
    case 'config':
      return <ConfigScreen />;
    case 'sorteo':
      return <SorteoScreen />;
    case 'fin-partida':
      return <GameOverScreen />;
    default:
      return <GameScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}
