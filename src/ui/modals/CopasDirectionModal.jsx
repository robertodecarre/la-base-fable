import { useGame } from '../../state/useGame.js';
import { nombreDe } from '../../state/selectors.js';

export default function CopasDirectionModal() {
  const { estado, dispatch } = useGame();
  return (
    <section>
      <h2>As de Copas</h2>
      <p>
        {nombreDe(estado, estado.pendienteCopas)} jugó el As de Copas. ¿Se invierte el sentido de
        juego?
      </p>
      <button type="button" onClick={() => dispatch({ type: 'ELEGIR_SENTIDO', invertir: false })}>
        Mantener sentido
      </button>
      <button type="button" onClick={() => dispatch({ type: 'ELEGIR_SENTIDO', invertir: true })}>
        Invertir sentido
      </button>
    </section>
  );
}
