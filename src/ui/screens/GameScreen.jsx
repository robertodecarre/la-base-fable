import { useGame } from '../../state/useGame.js';
import BiddingPanel from '../panels/BiddingPanel.jsx';
import ScoreBoard from '../panels/ScoreBoard.jsx';
import PlayerHand from '../table/PlayerHand.jsx';
import TrickArea from '../table/TrickArea.jsx';
import CopasDirectionModal from '../modals/CopasDirectionModal.jsx';
import OrosOpenerModal from '../modals/OrosOpenerModal.jsx';

export default function GameScreen() {
  const { estado, dispatch } = useGame();
  const { config } = estado;

  return (
    <section>
      <header>
        <h1>La Base</h1>
        <p>
          Mano {estado.indiceMano + 1}/{estado.cartasPorMano.length} — {estado.nBases} bases —
          Pie: {config.nombres[estado.pie]} — Mano: {config.nombres[estado.jugadorMano]} —
          Sentido: {estado.sentido === 1 ? 'antihorario' : 'horario'}
          {estado.modoRapido[0] || estado.modoRapido[1] ? ' — modo rápido activo' : ''}
        </p>
      </header>

      <ScoreBoard historial={estado.historial} puntos={estado.puntos} />

      {estado.fase === 'pedir' && <BiddingPanel />}
      {estado.fase === 'elegir-sentido' && <CopasDirectionModal />}
      {estado.fase === 'elegir-abridor' && <OrosOpenerModal />}

      {estado.fase === 'jugar' && (
        <>
          <TrickArea baseActual={estado.baseActual} nombres={config.nombres} />
          {estado.manos.map((mano, jugador) => (
            <PlayerHand
              key={jugador}
              nombre={config.nombres[jugador]}
              mano={mano}
              activo={estado.turno === jugador}
              onJugar={(cartaId) => dispatch({ type: 'JUGAR_CARTA', jugador, cartaId })}
            />
          ))}
        </>
      )}

      {estado.fase === 'fin-mano' && (
        <section>
          <h2>Fin de la mano</h2>
          <button type="button" onClick={() => dispatch({ type: 'CONTINUAR' })}>
            Repartir la próxima mano
          </button>
        </section>
      )}
    </section>
  );
}
