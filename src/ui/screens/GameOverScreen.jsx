import { useGame } from '../../state/useGame.js';
import ScoreBoard from '../panels/ScoreBoard.jsx';

export default function GameOverScreen() {
  const { estado, dispatch } = useGame();
  const { ganadorPartida, motivoFin } = estado;
  const texto =
    ganadorPartida === 'empate' ? 'Empate' : `Gana ${ganadorPartida === 0 ? 'Nosotros' : 'Ellos'}`;

  return (
    <section>
      <h1>Fin de la partida</h1>
      <p>
        {texto} ({motivoFin})
      </p>
      <ScoreBoard historial={estado.historial} puntos={estado.puntos} />
      <button type="button" onClick={() => dispatch({ type: 'REINICIAR' })}>
        Nueva partida
      </button>
    </section>
  );
}
